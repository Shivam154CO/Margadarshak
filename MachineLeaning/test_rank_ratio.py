"""
Test script to verify the rank_ratio categorization logic
"""

# Test the logic directly without needing the API
def calculate_rank_ratio_category(user_rank, cutoff_rank):
    """
    Calculate college category based on rank_ratio as the PRIMARY factor.
    
    Adjusted thresholds for better distribution:
    - Most Probable: rank_ratio ≤ 0.50 (User rank is at least 50% better than cutoff - very safe)
    - Best Fit: 0.50 < rank_ratio ≤ 0.80 (User rank is 20-50% better than cutoff)
    - Good Fit: 0.80 < rank_ratio ≤ 1.00 (User rank is equal to or up to 20% worse than cutoff)
    - Stretch: 1.00 < rank_ratio ≤ 1.30 (User rank is up to 30% worse than cutoff)
    """
    user_rank = int(user_rank) if user_rank else 0
    cutoff_rank = int(cutoff_rank) if cutoff_rank else 0
    
    # Handle edge cases
    if user_rank <= 0 or cutoff_rank <= 0:
        return "Unknown", 0.0, "Insufficient rank data"
    
    rank_ratio = user_rank / cutoff_rank
    
    # Adjusted thresholds for better distribution
    if rank_ratio <= 0.50:
        # Most Probable - User rank is at least 50% better than cutoff (very safe)
        percentage_better = ((cutoff_rank - user_rank) / cutoff_rank) * 100
        reason = f"Rank {user_rank:,} is {percentage_better:.1f}% better than cutoff {cutoff_rank:,} (ratio: {rank_ratio:.2f})"
        return "Most Probable", rank_ratio, reason
    
    elif rank_ratio <= 0.80:
        # Best Fit - User rank is 20-50% better than cutoff
        percentage_better = ((cutoff_rank - user_rank) / cutoff_rank) * 100
        reason = f"Rank {user_rank:,} is {percentage_better:.1f}% better than cutoff {cutoff_rank:,} (ratio: {rank_ratio:.2f})"
        return "Best Fit", rank_ratio, reason
    
    elif rank_ratio <= 1.00:
        # Good Fit - User rank is equal to or up to 20% worse than cutoff
        percentage_weaker = ((user_rank - cutoff_rank) / cutoff_rank) * 100
        reason = f"Rank {user_rank:,} is {percentage_weaker:.1f}% below cutoff {cutoff_rank:,} (ratio: {rank_ratio:.2f})"
        return "Good Fit", rank_ratio, reason
    
    elif rank_ratio <= 1.30:
        # Stretch - User rank is up to 30% worse than cutoff
        percentage_weaker = ((user_rank - cutoff_rank) / cutoff_rank) * 100
        reason = f"Rank {user_rank:,} is {percentage_weaker:.1f}% below cutoff {cutoff_rank:,} (risky - ratio: {rank_ratio:.2f})"
        return "Stretch", rank_ratio, reason
    
    else:
        # Beyond 1.30 - too weak
        percentage_weaker = ((user_rank - cutoff_rank) / cutoff_rank) * 100
        reason = f"Rank {user_rank:,} is {percentage_weaker:.1f}% below cutoff {cutoff_rank:,} (very risky - ratio: {rank_ratio:.2f})"
        return "Stretch", rank_ratio, reason


# Test cases
print("=" * 70)
print("Testing Rank Ratio Categorization Logic")
print("=" * 70)

# Example: User rank = 1000
print("\n📊 Test with User Rank = 1000:")
test_cases = [
    (1000, 500),   # ratio = 2.0 - Very weak
    (1000, 800),   # ratio = 1.25 - Stretch
    (1000, 900),   # ratio = 1.11 - Good Fit
    (1000, 1000),  # ratio = 1.0 - Best Fit (exact)
    (1000, 1100),  # ratio = 0.91 - Best Fit
    (1000, 1200),  # ratio = 0.83 - Best Fit
    (1000, 1250),  # ratio = 0.80 - Most Probable (exactly at boundary)
    (1000, 1300),  # ratio = 0.77 - Most Probable
    (1000, 1500),  # ratio = 0.67 - Most Probable
    (1000, 2000),  # ratio = 0.50 - Most Probable
]

print("\n{:<10} {:<10} {:<10} {:<15}".format("User Rank", "Cutoff", "Ratio", "Category"))
print("-" * 50)

for user_rank, cutoff_rank in test_cases:
    category, ratio, reason = calculate_rank_ratio_category(user_rank, cutoff_rank)
    print("{:<10} {:<10} {:<10.2f} {:<15}".format(user_rank, cutoff_rank, ratio, category))

# Realistic test cases with typical values
print("\n" + "=" * 70)
print("Realistic Test Cases (User Rank = 2500)")
print("=" * 70)

user_rank = 2500
cutoff_ranks = [1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000]

print("\n{:<12} {:<10} {:<10} {:<15}".format("User Rank", "Cutoff", "Ratio", "Category"))
print("-" * 55)

for cutoff in cutoff_ranks:
    category, ratio, reason = calculate_rank_ratio_category(user_rank, cutoff)
    print("{:<12} {:<10} {:<10.2f} {:<15}".format(user_rank, cutoff, ratio, category))

print("\n" + "=" * 70)
print("Explanation of Categories:")
print("=" * 70)
print("""
Most Probable: rank_ratio ≤ 0.80
  - User rank is at least 20% BETTER than cutoff
  - Example: User rank 1000, Cutoff 2000 (ratio = 0.50)

Best Fit: 0.80 < rank_ratio ≤ 1.00
  - User rank is equal to or slightly worse than cutoff (within 20%)
  - Example: User rank 2200, Cutoff 2000 (ratio = 1.10)

Good Fit: 1.00 < rank_ratio ≤ 1.20
  - User rank is up to 20% WORSE than cutoff
  - Example: User rank 2400, Cutoff 2000 (ratio = 1.20)

Stretch: 1.20 < rank_ratio ≤ 1.40
  - User rank is 20-40% WORSE than cutoff
  - Example: User rank 2800, Cutoff 2000 (ratio = 1.40)
""")
