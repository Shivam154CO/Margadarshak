"""
app/core/predictor.py
All prediction logic, rank-ratio heuristics, category helpers.
Zero Flask imports — pure Python business logic.
"""
import numpy as np


# ─── Category Helpers ────────────────────────────────────────────────────────

def get_category_variations(user_category: str) -> list:
    category_map = {
        'OPEN':    ['OPEN', 'GOPEN', 'LOPEN', 'GEN', 'GENERAL', 'OPN', 'GO', 'LO'],
        'OBC':     ['OBC', 'GOBC', 'LOBC', 'OBCNCL', 'OBC-NCL', 'GOBCNCL', 'LOBCNCL'],
        'SC':      ['SC', 'GSC', 'LSC'],
        'ST':      ['ST', 'GST', 'LST'],
        'VJ':      ['VJ', 'VJNT', 'VJDT', 'VJ/DT', 'GVJNT', 'LVJNT', 'GVJ', 'LVJ'],
        'DT':      ['DT', 'VJDT', 'VJ/DT', 'DTNT', 'GDT', 'LDT'],
        'NT-A':    ['NT(A)', 'NTA', 'NT-A', 'NT1', 'GNTC', 'LNTC', 'GNT1', 'LNT1'],
        'NT(A)':   ['NT(A)', 'NTA', 'NT-A', 'NT1', 'GNTC', 'LNTC', 'GNT1', 'LNT1'],
        'NT-B':    ['NT(B)', 'NTB', 'NT-B', 'NT2', 'GNTB', 'LNTB', 'GNT2', 'LNT2'],
        'NT(B)':   ['NT(B)', 'NTB', 'NT-B', 'NT2', 'GNTB', 'LNTB', 'GNT2', 'LNT2'],
        'NT-C':    ['NT(C)', 'NTC', 'NT-C', 'NT3', 'GNTC', 'LNTC', 'GNT3', 'LNT3'],
        'NT(C)':   ['NT(C)', 'NTC', 'NT-C', 'NT3', 'GNTC', 'LNTC', 'GNT3', 'LNT3'],
        'NT-D':    ['NT(D)', 'NTD', 'NT-D', 'NT4', 'GNTD', 'LNTD', 'GNT4', 'LNT4'],
        'NT(D)':   ['NT(D)', 'NTD', 'NT-D', 'NT4', 'GNTD', 'LNTD', 'GNT4', 'LNT4'],
        'SBC':     ['SBC', 'SEBC', 'GSEBC', 'LSEBC', 'GSBC', 'LSBC'],
        'EWS':     ['EWS', 'GEWS', 'LEWS', 'EWSG', 'EWSL'],
        'TFWS':    ['TFWS', 'TFW', 'GTFWS', 'LTFWS'],
        'MI':      ['MI', 'GMI', 'LMI'],
        'DEFENCE': ['DEFENCE', 'DEF', 'GDEF', 'LDEF']
    }
    user_cat = str(user_category).upper().strip()
    if user_cat in category_map:
        return category_map[user_cat]
    for variations in category_map.values():
        if user_cat in [v.upper() for v in variations]:
            return variations
    if user_cat.startswith(('G', 'L')) and len(user_cat) > 1:
        base = user_cat[1:]
        if base in category_map:
            return category_map[base]
    return [user_cat]


# ─── Rank Ratio Core ─────────────────────────────────────────────────────────

def calculate_rank_ratio_category(user_rank: int, cutoff_rank: int):
    """
    Returns (category, rank_ratio, reason) based on rank_ratio thresholds.
    - Most Probable : rank_ratio < 0.15
    - Good Fit      : 0.15 – 0.45
    - Best Fit      : 0.45 – 0.85
    - Stretch       : 0.85 – 1.15
    - Reach         : > 1.15
    """
    user_rank   = int(user_rank)   if user_rank   else 0
    cutoff_rank = int(cutoff_rank) if cutoff_rank else 0

    if user_rank <= 0 or cutoff_rank <= 0:
        return "Unknown", 0.0, "Insufficient rank data"

    rank_ratio = user_rank / cutoff_rank

    if rank_ratio > 1.15:
        return "Reach",         rank_ratio, f"Rank {user_rank:,} is far above cutoff {cutoff_rank:,} (Risk)"
    elif rank_ratio >= 0.85:
        return "Stretch",       rank_ratio, f"Rank {user_rank:,} is near/at cutoff {cutoff_rank:,} (Exactly Matching)"
    elif rank_ratio > 0.45:
        return "Best Fit",      rank_ratio, f"Rank {user_rank:,} matches {cutoff_rank:,} (Best Fit)"
    elif rank_ratio > 0.15:
        return "Good Fit",      rank_ratio, f"Rank {user_rank:,} is comfortably within {cutoff_rank:,} (Good Fit)"
    else:
        return "Most Probable", rank_ratio, f"Rank {user_rank:,} is highly likely for {cutoff_rank:,} (Most Probable)"


def check_most_probable(user_score, user_rank, cutoff_rank, cutoff_percentile):
    """Returns (is_probable: bool, reason: str)."""
    is_probable        = False
    confidence_reasons = []

    user_score       = float(user_score)       if user_score       else 0
    user_rank        = int(user_rank)           if user_rank        else 0
    cutoff_rank      = int(cutoff_rank)         if cutoff_rank      else 0
    cutoff_percentile = float(cutoff_percentile) if cutoff_percentile else 0

    rank_condition  = False
    score_condition = False

    if user_rank > 0 and cutoff_rank > 0:
        if user_rank == cutoff_rank:
            rank_condition = True
            confidence_reasons.append(f"EXACT MATCH: Rank {user_rank} = Cutoff {cutoff_rank}")
        elif abs(user_rank - cutoff_rank) <= 50:
            rank_condition = True
            confidence_reasons.append(f"VERY NEAR: Rank {user_rank} ≈ {cutoff_rank} (±50)")
        elif user_rank < cutoff_rank:
            rank_buffer = cutoff_rank - user_rank
            rank_condition = True
            confidence_reasons.append(f"BETTER: Rank {user_rank} is {rank_buffer:,} below cutoff {cutoff_rank:,}")

    if user_score > 0 and cutoff_percentile > 0:
        if user_score == cutoff_percentile:
            score_condition = True
            confidence_reasons.append(f"EXACT MATCH: Score {user_score:.1f}% = Cutoff {cutoff_percentile:.1f}%")
        elif user_score >= cutoff_percentile:
            score_condition = True
            confidence_reasons.append(f"AT/ABOVE CUTOFF: Score {user_score:.1f}% >= {cutoff_percentile:.1f}%")
        elif abs(user_score - cutoff_percentile) <= 1.5:
            score_condition = True
            confidence_reasons.append(f"NEAR: Score {user_score:.1f}% ≈ {cutoff_percentile:.1f}%")

    if rank_condition or score_condition:
        is_probable = True

    return is_probable, " | ".join(confidence_reasons)


# ─── Reason Generators ───────────────────────────────────────────────────────

def generate_rank_based_reason(user_score, user_rank, cutoff_rank, cutoff_percentile,
                                category, match_score, admission_chance,
                                is_most_probable=False, probable_reason="", rank_ratio=0.0) -> str:
    """Generate detailed fit explanation based on rank_ratio logic."""
    reasons = []

    if is_most_probable:
        reasons.append(f"🎯 MOST PROBABLE - {probable_reason}")

    if user_rank > 0 and cutoff_rank > 0:
        rank_diff = cutoff_rank - user_rank
        if rank_diff > 0:
            pct = (rank_diff / cutoff_rank) * 100
            reasons.append(f"Rank {user_rank:,} is {pct:.1f}% better than cutoff {cutoff_rank:,}")
        else:
            pct = (abs(rank_diff) / cutoff_rank) * 100
            reasons.append(f"Rank {user_rank:,} is {pct:.1f}% below cutoff {cutoff_rank:,}")
        reasons.append(f"Rank ratio: {rank_ratio:.2f}")

    if user_score > 0 and cutoff_percentile > 0:
        score_diff = user_score - cutoff_percentile
        if score_diff > 0:
            reasons.append(f"Score {user_score:.1f}% is {score_diff:.1f} above cutoff {cutoff_percentile:.1f}%")
        else:
            reasons.append(f"Score {user_score:.1f}% is {abs(score_diff):.1f} below cutoff {cutoff_percentile:.1f}%")

    category_labels = {
        "Most Probable": "✅ Very high confidence - extremely safe choice",
        "Best Fit":      "✅ Strong candidate - very high probability",
        "Good Fit":      "✅ Realistic choice - solid probability",
        "Stretch":       "⚠️ Aggressive choice - high competition level",
        "Reach":         "⚠️ Reach goal - risky but possible"
    }
    reasons.append(category_labels.get(category, ""))

    return " | ".join(filter(None, reasons))


def generate_fit_reason(user_score, user_rank, cutoff_rank, cutoff_percentile,
                        fit_category, match_score, admission_chance,
                        is_most_probable=False, probable_reason="") -> str:
    """Secondary reason generator (legacy compatibility)."""
    reasons = []

    if is_most_probable:
        reasons.append(f"🎯 MOST PROBABLE - {probable_reason}")

    if user_rank > 0 and cutoff_rank > 0:
        rank_diff = cutoff_rank - user_rank
        if rank_diff > 0:
            reasons.append(f"Rank {user_rank:,} is {rank_diff:,} better than cutoff {cutoff_rank:,}")
        else:
            reasons.append(f"Rank {user_rank:,} is {abs(rank_diff):,} below cutoff {cutoff_rank:,}")

    if user_score > 0 and cutoff_percentile > 0:
        score_diff = user_score - cutoff_percentile
        if score_diff > 0:
            reasons.append(f"Score {user_score:.1f}% is {score_diff:.1f} above cutoff {cutoff_percentile:.1f}%")
        else:
            reasons.append(f"Score {user_score:.1f}% is {abs(score_diff):.1f} below cutoff {cutoff_percentile:.1f}%")

    if is_most_probable:
        reasons.append("✅ Near-perfect match - almost guaranteed")
    elif fit_category == "Best Fit":
        reasons.append("✅ Strong candidate - high probability")
    elif fit_category == "Good Fit":
        reasons.append("✅ Good candidate - solid chance")
    elif fit_category == "Stretch":
        reasons.append("⚠️ Competitive - backup option")
    else:
        reasons.append("⚠️ Challenging - explore alternatives")

    return " | ".join(reasons)


# ─── Main Prediction Model ───────────────────────────────────────────────────

def advanced_prediction_model(user_score, user_rank, cutoff_rank, cutoff_percentile):
    """
    Primary prediction engine using rank_ratio as the main signal.
    Returns: (category, match_score, admission_chance, reason, is_most_probable)
    """
    user_score        = float(user_score)        if user_score        else 0
    user_rank         = int(user_rank)            if user_rank         else 0
    cutoff_rank       = int(cutoff_rank)          if cutoff_rank       else 0
    cutoff_percentile = float(cutoff_percentile)  if cutoff_percentile else 0

    if user_rank > 0 and cutoff_rank > 0:
        category, rank_ratio, _ = calculate_rank_ratio_category(user_rank, cutoff_rank)
        is_most_probable = (category == "Most Probable")

        if category == "Most Probable":
            match_score     = 98 - (rank_ratio * 15)
            admission_chance = 98 - (rank_ratio * 10)
        elif category == "Good Fit":
            match_score     = 90 - (rank_ratio * 20)
            admission_chance = 88 - (rank_ratio * 15)
        elif category == "Best Fit":
            match_score     = 80 - (rank_ratio * 20)
            admission_chance = 75 - (rank_ratio * 20)
        elif category == "Stretch":
            match_score     = 65 - (rank_ratio * 20)
            admission_chance = 55 - (rank_ratio * 20)
        else:  # Reach
            match_score     = max(10, 30 - (rank_ratio * 10))
            admission_chance = max(10, 30 - (rank_ratio * 10))

        reason = generate_rank_based_reason(
            user_score, user_rank, cutoff_rank, cutoff_percentile,
            category, match_score, admission_chance, is_most_probable, rank_ratio
        )
        return category, round(match_score, 1), admission_chance, reason, is_most_probable

    elif user_score > 0 and cutoff_percentile > 0:
        score_diff = user_score - cutoff_percentile
        if score_diff >= 35:
            category, match_score, admission_chance = "Most Probable", 95, 98
        elif score_diff >= 20:
            category, match_score, admission_chance = "Best Fit", 85, 92
        elif score_diff >= 5:
            category, match_score, admission_chance = "Good Fit", 75, 80
        else:
            category, match_score, admission_chance = "Stretch", 60, 65

        is_most_probable = (category == "Most Probable")
        reason = generate_rank_based_reason(
            user_score, user_rank, cutoff_rank, cutoff_percentile,
            category, match_score, admission_chance, is_most_probable, 0.0
        )
        return category, round(match_score, 1), admission_chance, reason, is_most_probable

    return "Unknown", 50, 50, "Insufficient data for prediction", False


def calculate_admission_chance(match_score: float, fit_category: str) -> int:
    """Legacy helper — maps match_score to a percentage chance."""
    thresholds = [45, 40, 35, 30, 25, 20, 15, 10, 5]
    base_values = [92, 87, 82, 75, 68, 58, 48, 35, 22]
    base_chance = 12
    for threshold, base in zip(thresholds, base_values):
        if match_score >= threshold:
            base_chance = base
            break
    adjustments = {"Best Fit": 3, "Good Fit": 0, "Stretch": -5, "Unlikely Fit": -8}
    return max(5, min(95, base_chance + adjustments.get(fit_category, 0)))


# ─── Insights ────────────────────────────────────────────────────────────────

def generate_overall_insights(results: list, user_rank: int) -> str:
    """Generate strategic AI insights based on the full results set."""
    if not results:
        return "Not enough data for insights."

    mp_count = len([r for r in results if r['probability_level'] == 'Most Probable'])
    bf_count = len([r for r in results if r['probability_level'] == 'Best Fit'])
    st_count = len([r for r in results if r['probability_level'] == 'Stretch'])
    max_pkg  = max((r['highest_package_lpa'] for r in results), default=0)

    insights = [
        f"AI STRATEGY: Your Rank {user_rank} is exceptionally strong, placing you in the top tier of candidates.",
        f"ANALYSIS: We've identified {mp_count + bf_count} colleges where you are extremely safe, and {st_count} high-prestige 'Stretch' goals.",
        f"PLACEMENT: The top-tier colleges in your list offer packages up to {max_pkg} LPA."
    ]

    if mp_count > 100:
        insights.append("ADVICE: Since you have 100+ 'Most Probable' options, focus your search on the top 20 colleges by prestige/placement.")
    elif bf_count < 10:
        insights.append("ADVICE: Your 'Best Fit' range is narrow. Consider exploring more branches in top colleges.")

    return " ".join(insights)
