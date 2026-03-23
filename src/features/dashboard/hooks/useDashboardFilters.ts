import { useState, useMemo, useCallback } from "react";
import { debounce } from "lodash";
import type { College } from "@/types/college";

export function useDashboardFilters(colleges: College[]) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 300),
    []
  );

  const handleSearch = useCallback((value: string) => {
    setSearchInput(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const filtered = useMemo(() => {
    let result = colleges;

    if (selectedBranch) {
      result = result.filter((c) => c.branch === selectedBranch);
    }
    if (selectedCity) {
      result = result.filter((c) => c.city.toLowerCase() === selectedCity.toLowerCase());
    }
    if (selectedDistrict) {
      result = result.filter((c) => c.district?.toLowerCase() === selectedDistrict.toLowerCase());
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.college_name.toLowerCase().includes(term) ||
          c.city.toLowerCase().includes(term) ||
          c.district?.toLowerCase().includes(term) ||
          c.college_code.toLowerCase().includes(term) ||
          c.branch?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [colleges, selectedBranch, selectedCity, selectedDistrict, searchTerm]);

  const onClearFilters = useCallback(() => {
    setSelectedBranch("");
    setSelectedCity("");
    setSelectedDistrict("");
    setSearchInput("");
    setSearchTerm("");
    setActiveFilter("all");
  }, []);

  return {
    activeFilter,
    setActiveFilter,
    selectedBranch,
    setSelectedBranch,
    selectedCity,
    setSelectedCity,
    selectedDistrict,
    setSelectedDistrict,
    searchInput,
    handleSearch,
    filtered,
    onClearFilters,
  };
}
