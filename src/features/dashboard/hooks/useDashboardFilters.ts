import { useState, useMemo, useCallback } from "react";
import { debounce } from "lodash";
import type { College } from "@/types/college";

export const getCollegeType = (c: College): string => {
  const name = c.college_name.toLowerCase();
  const autoStr = (c.autonomy_status || '').toLowerCase();
  
  if (name.includes('government') || name.includes('govt')) {
    if (name.includes('aided')) {
      return 'Government-Aided';
    }
    return 'Government';
  }
  if (autoStr.includes('autonoumous') || autoStr.includes('autonomous')) {
    return 'Autonomous';
  }
  if (name.includes('deemed') || name.includes('university')) {
    return 'Deemed';
  }
  if (name.includes('aided')) {
    return 'Government-Aided';
  }
  return 'Private';
};

export const getGenderType = (c: College): string => {
  const name = c.college_name.toLowerCase();
  if (name.includes('women') || name.includes('girls') || name.includes('ladies') || name.includes('female')) {
    return 'Girls Only';
  }
  return 'Co-ed';
};

export function useDashboardFilters(colleges: College[]) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCollegeType, setSelectedCollegeType] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
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
      result = result.filter((c) => (c.branch || c.branch_name) === selectedBranch);
    }
    if (selectedCity) {
      result = result.filter((c) => c.city.toLowerCase() === selectedCity.toLowerCase());
    }
    if (selectedDistrict) {
      result = result.filter((c) => c.district?.toLowerCase() === selectedDistrict.toLowerCase());
    }
    if (selectedRegion) {
      result = result.filter((c) => c.region?.toLowerCase() === selectedRegion.toLowerCase());
    }
    if (selectedState) {
      result = result.filter((c) => (c.state || 'Maharashtra').toLowerCase() === selectedState.toLowerCase());
    }
    if (selectedCollegeType) {
      result = result.filter((c) => getCollegeType(c).toLowerCase() === selectedCollegeType.toLowerCase());
    }
    if (selectedUniversity) {
      result = result.filter((c) => c.university?.toLowerCase() === selectedUniversity.toLowerCase());
    }
    if (selectedCategory) {
      result = result.filter((c) => c.category?.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (selectedGender) {
      result = result.filter((c) => getGenderType(c).toLowerCase() === selectedGender.toLowerCase());
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.college_name.toLowerCase().includes(term) ||
          c.city.toLowerCase().includes(term) ||
          c.district?.toLowerCase().includes(term) ||
          c.region?.toLowerCase().includes(term) ||
          c.college_code.toLowerCase().includes(term) ||
          (c.branch || c.branch_name)?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [
    colleges, selectedBranch, selectedCity, selectedDistrict, 
    selectedRegion, selectedState, selectedCollegeType, 
    selectedUniversity, selectedCategory, selectedGender, searchTerm
  ]);

  const onClearFilters = useCallback(() => {
    setSelectedBranch("");
    setSelectedCity("");
    setSelectedDistrict("");
    setSelectedRegion("");
    setSelectedState("");
    setSelectedCollegeType("");
    setSelectedUniversity("");
    setSelectedCategory("");
    setSelectedGender("");
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
    selectedRegion,
    setSelectedRegion,
    selectedState,
    setSelectedState,
    selectedCollegeType,
    setSelectedCollegeType,
    selectedUniversity,
    setSelectedUniversity,
    selectedCategory,
    setSelectedCategory,
    selectedGender,
    setSelectedGender,
    searchInput,
    handleSearch,
    filtered,
    onClearFilters,
  };
}
