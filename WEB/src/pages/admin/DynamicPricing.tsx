import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, Edit2, Save, X, Download } from "lucide-react";
import { useAdminStore } from "../../store/adminStore";
import type { DynamicPricing } from "../../store/adminStore";
import * as XLSX from 'xlsx';

export function DynamicPricing() {
  const [activeTab, setActiveTab] = useState<"base" | "dynamic">("base");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [updatingBase, setUpdatingBase] = useState(false);

  // Connect to admin store
  const { dynamicPricings, fetchPricings, updatePricingById, loadingPricing } =
    useAdminStore();

  // Editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<DynamicPricing>>({});
  const [editedSpecialization, setEditedSpecialization] = useState<
    Record<string, number>
  >({});
  const [editedExperience, setEditedExperience] = useState<
    Record<string, number>
  >({});
  const [editedSurface, setEditedSurface] = useState<Record<string, number>>(
    {}
  );

  const inputRefs = useRef({
    price_per_kilometer: null as HTMLInputElement | null,
    price_per_hour: null as HTMLInputElement | null,
    equipments_price: null as HTMLInputElement | null,
    advantages_reduction: null as HTMLInputElement | null,
  });

  // Memoized handlers to prevent unnecessary re-renders
  const handleSaveSpecializationPrice = useCallback(async (id: string) => {
    if (editedSpecialization[id] === undefined) return;

    setUpdatingBase(true);
    try {
      await handleUpdateSpecializationPrice(id, editedSpecialization[id]);
      setEditedSpecialization((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (error) {
      console.error("Failed to update specialization price:", error);
    } finally {
      setUpdatingBase(false);
    }
  }, [editedSpecialization]);

  const handleSaveExperienceMultiplier = useCallback(async (id: string) => {
    if (editedExperience[id] === undefined) return;

    setUpdatingBase(true);
    try {
      await handleUpdateExperienceMultiplier(id, editedExperience[id]);
      setEditedExperience((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (error) {
      console.error("Failed to update experience multiplier:", error);
    } finally {
      setUpdatingBase(false);
    }
  }, [editedExperience]);

  const handleSaveSurfacePrice = useCallback(async (id: string) => {
    if (editedSurface[id] === undefined) return;

    setUpdatingBase(true);
    try {
      await handleUpdateSurfacePrice(id, editedSurface[id]);
      setEditedSurface((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (error) {
      console.error("Failed to update surface price:", error);
    } finally {
      setUpdatingBase(false);
    }
  }, [editedSurface]);

  // Fetch pricing data on mount
  useEffect(() => {
    fetchPricings();
  }, [fetchPricings]);

  // Derive base pricing data from dynamicPricings
  const {
    specializationPricingData,
    experiencePricingData,
    surfacePricingData,
  } = useMemo(() => {
    const specializationMap = new Map<string, number>();
    const experienceMap = new Map<string, number>();
    const surfaceMap = new Map<string, number>();

    // Aggregate data from all dynamic pricings
    dynamicPricings.forEach((pricing) => {
      // Specialization base prices
      const specKey = `${pricing.actor_rank}-${pricing.actor_specialization2}`;
      if (!specializationMap.has(specKey)) {
        specializationMap.set(specKey, pricing.specialization_base_price);
      }

      // Experience multipliers
      const expKey = `${pricing.actor_rank}-${pricing.experience_level}`;
      if (!experienceMap.has(expKey)) {
        experienceMap.set(expKey, pricing.experience_multiplier);
      }

      // Surface unit prices
      const surfaceKey = pricing.surface_unit2;
      if (!surfaceMap.has(surfaceKey)) {
        surfaceMap.set(surfaceKey, pricing.surface_unit_price);
      }
    });

    // Convert maps to arrays for table rendering
    const specializationPricingData = Array.from(
      specializationMap.entries()
    ).map(([key, base_price]) => {
      const [actor_rank, actor_specialization2] = key.split("-");
      return {
        id: key,
        actor_rank: actor_rank as "worker" | "advisor" | "entrepreneur",
        specialization: actor_specialization2,
        base_price,
      };
    });

    const experiencePricingData = Array.from(experienceMap.entries()).map(
      ([key, multiplier]) => {
        const [actor_rank, experience_level] = key.split("-");
        return {
          id: key,
          actor_rank: actor_rank as "worker" | "advisor" | "entrepreneur",
          experience_level: experience_level as
            | "starter"
            | "qualified"
            | "expert",
          multiplier,
        };
      }
    );

    const surfacePricingData = Array.from(surfaceMap.entries()).map(
      ([surface_unit, price_per_unit]) => ({
        id: surface_unit,
        surface_unit,
        price_per_unit,
      })
    );

    return {
      specializationPricingData,
      experiencePricingData,
      surfacePricingData,
    };
  }, [dynamicPricings]);

  // Excel export functionality
  const exportToExcel = useCallback(() => {
    try {
      const workbook = XLSX.utils.book_new();

      // Export Specialization Pricing
      const specializationWS = XLSX.utils.json_to_sheet(
        specializationPricingData.map(sp => ({
          'Actor Rank': sp.actor_rank,
          'Specialization': sp.specialization.replace(/_/g, ' '),
          'Base Price (FCFA)': sp.base_price
        }))
      );
      XLSX.utils.book_append_sheet(workbook, specializationWS, "Specialization Pricing");

      // Export Experience Level Multipliers
      const experienceWS = XLSX.utils.json_to_sheet(
        experiencePricingData.map(ep => ({
          'Actor Rank': ep.actor_rank,
          'Experience Level': ep.experience_level,
          'Multiplier': ep.multiplier
        }))
      );
      XLSX.utils.book_append_sheet(workbook, experienceWS, "Experience Multipliers");

      // Export Surface Unit Pricing
      const surfaceWS = XLSX.utils.json_to_sheet(
        surfacePricingData.map(sp => ({
          'Surface Unit': sp.surface_unit,
          'Price per Unit (FCFA)': sp.price_per_unit
        }))
      );
      XLSX.utils.book_append_sheet(workbook, surfaceWS, "Surface Unit Pricing");

      // Export Dynamic Pricing Rules
      const dynamicWS = XLSX.utils.json_to_sheet(
        dynamicPricings.map(dp => ({
          'Actor Rank': dp.actor_rank,
          'Specialization': dp.actor_specialization2.replace(/_/g, ' '),
          'Experience Level': dp.experience_level,
          'Surface Unit': dp.surface_unit2,
          'Specialization Base Price (FCFA)': dp.specialization_base_price,
          'Experience Multiplier': dp.experience_multiplier,
          'Surface Unit Price (FCFA)': dp.surface_unit_price,
          'Price per Kilometer (FCFA)': dp.price_per_kilometer,
          'Price per Hour (FCFA)': dp.price_per_hour,
          'Equipment Price (FCFA)': dp.equipments_price,
          'Advantage Reduction (%)': dp.advantages_reduction
        }))
      );
      XLSX.utils.book_append_sheet(workbook, dynamicWS, "Dynamic Pricing Rules");

      // Generate filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const filename = `dynamic_pricing_${dateStr}.xlsx`;

      // Write and download file
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export data. Please try again.");
    }
  }, [specializationPricingData, experiencePricingData, surfacePricingData, dynamicPricings]);

  // Handle base price updates
  const handleUpdateSpecializationPrice = async (
    id: string,
    newBasePrice: number
  ) => {
    if (isNaN(newBasePrice) || newBasePrice < 0) {
      throw new Error("Invalid base price value");
    }

    setUpdatingBase(true);
    try {
      // Find all dynamic pricings that need updating
      const [actor_rank, specialization] = id.split("-");
      const pricingsToUpdate = dynamicPricings.filter(
        (p) =>
          p.actor_rank === actor_rank &&
          p.actor_specialization2 === specialization
      );

      // Update all related dynamic pricings
      await Promise.all(
        pricingsToUpdate.map((pricing) =>
          updatePricingById(pricing.id, {
            specialization_base_price: newBasePrice,
          })
        )
      );
    } catch (error) {
      console.error("Failed to update base price", error);
      throw error;
    } finally {
      setUpdatingBase(false);
    }
  };

  const handleUpdateExperienceMultiplier = async (
    id: string,
    newMultiplier: number
  ) => {
    if (isNaN(newMultiplier) || newMultiplier < 0.5 || newMultiplier > 3.0) {
      throw new Error("Experience multiplier must be between 0.5 and 3.0");
    }

    setUpdatingBase(true);
    try {
      const [actor_rank, experience_level] = id.split("-");
      const pricingsToUpdate = dynamicPricings.filter(
        (p) =>
          p.actor_rank === actor_rank && p.experience_level === experience_level
      );

      await Promise.all(
        pricingsToUpdate.map((pricing) =>
          updatePricingById(pricing.id, {
            experience_multiplier: newMultiplier,
          })
        )
      );
    } catch (error) {
      console.error("Failed to update experience multiplier", error);
      throw error;
    } finally {
      setUpdatingBase(false);
    }
  };

  const handleUpdateSurfacePrice = async (id: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice < 0) {
      throw new Error("Invalid surface price value");
    }

    setUpdatingBase(true);
    try {
      const pricingsToUpdate = dynamicPricings.filter(
        (p) => p.surface_unit2 === id
      );

      await Promise.all(
        pricingsToUpdate.map((pricing) =>
          updatePricingById(pricing.id, { surface_unit_price: newPrice })
        )
      );
    } catch (error) {
      console.error("Failed to update surface price", error);
      throw error;
    } finally {
      setUpdatingBase(false);
    }
  };

  // Handle editing
  const handleEdit = useCallback((pricing: DynamicPricing) => {
    setEditingId(pricing.id);
    setEditValues({ ...pricing });

    // Focus first field after render
    setTimeout(() => {
      inputRefs.current.price_per_kilometer?.focus();
    }, 0);
  }, []);

  const handleSave = useCallback(async (id: string) => {
    try {
      const updatedValues: Partial<DynamicPricing> = {};
      
      // Validate and parse values
      const pricePerKm = inputRefs.current.price_per_kilometer?.value;
      const pricePerHour = inputRefs.current.price_per_hour?.value;
      const equipmentPrice = inputRefs.current.equipments_price?.value;
      const advantageReduction = inputRefs.current.advantages_reduction?.value;

      if (pricePerKm !== undefined && pricePerKm !== '') {
        const parsed = parseFloat(pricePerKm);
        if (isNaN(parsed) || parsed < 0) {
          throw new Error("Invalid price per kilometer value");
        }
        updatedValues.price_per_kilometer = parsed;
      }

      if (pricePerHour !== undefined && pricePerHour !== '') {
        const parsed = parseFloat(pricePerHour);
        if (isNaN(parsed) || parsed < 0) {
          throw new Error("Invalid price per hour value");
        }
        updatedValues.price_per_hour = parsed;
      }

      if (equipmentPrice !== undefined && equipmentPrice !== '') {
        const parsed = parseFloat(equipmentPrice);
        if (isNaN(parsed) || parsed < 0) {
          throw new Error("Invalid equipment price value");
        }
        updatedValues.equipments_price = parsed;
      }

      if (advantageReduction !== undefined && advantageReduction !== '') {
        const parsed = parseFloat(advantageReduction);
        if (isNaN(parsed) || parsed < 0 || parsed > 100) {
          throw new Error("Advantage reduction must be between 0 and 100");
        }
        updatedValues.advantages_reduction = parsed;
      }

      await updatePricingById(id, updatedValues);
      setEditingId(null);
      setEditValues({});
    } catch (error) {
      console.error("Failed to update pricing", error);
      alert(error instanceof Error ? error.message : "Failed to update pricing");
    }
  }, [updatePricingById]);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setEditValues({});
  }, []);

  // Input change handlers with validation
  const handleSpecializationChange = useCallback((id: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setEditedSpecialization((prev) => ({
        ...prev,
        [id]: numValue,
      }));
    }
  }, []);

  const handleExperienceChange = useCallback((id: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0.5 && numValue <= 3.0) {
      setEditedExperience((prev) => ({
        ...prev,
        [id]: numValue,
      }));
    }
  }, []);

  const handleSurfaceChange = useCallback((id: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setEditedSurface((prev) => ({
        ...prev,
        [id]: numValue,
      }));
    }
  }, []);

  // Base Pricing Tables
  const basePricingTables = useMemo(() => (
    <div className="space-y-8">
      {/* Specialization Pricing Table */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Specialization Base Pricing (FCFA)
          </h2>
        </div>
        <div className="overflow-x-auto relative">
          {updatingBase && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
              <span className="text-lg font-medium">Updating prices...</span>
            </div>
          )}
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Actor Rank
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Specialization
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Base Price (FCFA)
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800">
              {specializationPricingData.map((sp) => (
                <tr key={sp.id}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-200 capitalize">
                    {sp.actor_rank}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-200 capitalize">
                    {sp.specialization.replace(/_/g, " ")}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      defaultValue={sp.base_price}
                      onChange={(e) => handleSpecializationChange(sp.id, e.target.value)}
                      className="w-32 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={updatingBase}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-200">
                    <button
                      onClick={() => handleSaveSpecializationPrice(sp.id)}
                      disabled={editedSpecialization[sp.id] === undefined || updatingBase}
                      className={`px-3 py-1 rounded transition-colors ${
                        editedSpecialization[sp.id] !== undefined
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Experience Level Pricing Table */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Experience Level Multipliers
        </h2>
        <div className="overflow-x-auto relative">
          {updatingBase && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
              <span className="text-lg font-medium">
                Updating multipliers...
              </span>
            </div>
          )}
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Actor Rank
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Experience Level
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Multiplier
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800">
              {experiencePricingData.map((ep) => (
                <tr key={ep.id}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-200 capitalize">
                    {ep.actor_rank}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-200 capitalize">
                    {ep.experience_level}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      defaultValue={ep.multiplier}
                      onChange={(e) => handleExperienceChange(ep.id, e.target.value)}
                      className="w-24 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={updatingBase}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-200">
                    <button
                      onClick={() => handleSaveExperienceMultiplier(ep.id)}
                      disabled={editedExperience[ep.id] === undefined || updatingBase}
                      className={`px-3 py-1 rounded transition-colors ${
                        editedExperience[ep.id] !== undefined
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Surface Unit Pricing Table */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Surface Unit Pricing (FCFA)
        </h2>
        <div className="overflow-x-auto relative">
          {updatingBase && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
              <span className="text-lg font-medium">Updating prices...</span>
            </div>
          )}
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Surface Unit
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Price per Unit (FCFA)
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800">
              {surfacePricingData.map((sp) => (
                <tr key={sp.id}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-200 capitalize">
                    {sp.surface_unit}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-200">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      defaultValue={sp.price_per_unit}
                      onChange={(e) => handleSurfaceChange(sp.id, e.target.value)}
                      className="w-32 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={updatingBase}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-200">
                    <button
                      onClick={() => handleSaveSurfacePrice(sp.id)}
                      disabled={editedSurface[sp.id] === undefined || updatingBase}
                      className={`px-3 py-1 rounded transition-colors ${
                        editedSurface[sp.id] !== undefined
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ), [
    specializationPricingData,
    experiencePricingData,
    surfacePricingData,
    updatingBase,
    editedSpecialization,
    editedExperience,
    editedSurface,
    handleSaveSpecializationPrice,
    handleSaveExperienceMultiplier,
    handleSaveSurfacePrice,
    handleSpecializationChange,
    handleExperienceChange,
    handleSurfaceChange
  ]);

  // Dynamic Pricing Table Columns
  const columnHelper = createColumnHelper<DynamicPricing>();
  const dynamicPricingColumns = useMemo(() => [
    columnHelper.accessor("actor_rank", {
      header: "Actor Rank",
      cell: (info) => (
        <span className="font-medium capitalize">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor("actor_specialization2", {
      header: "Specialization",
      cell: (info) => (
        <div>
          <div className="capitalize">{info.getValue().replace(/_/g, " ")}</div>
          <div className="text-xs text-gray-500">
            Base: {info.row.original.specialization_base_price.toLocaleString()}{" "}
            FCFA
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("experience_level", {
      header: "Experience Level",
      cell: (info) => (
        <div>
          <div className="capitalize">{info.getValue()}</div>
          <div className="text-xs text-gray-500">
            Multiplier: {info.row.original.experience_multiplier.toFixed(1)}x
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("surface_unit2", {
      header: "Surface Unit",
      cell: (info) => (
        <div>
          <div className="capitalize">{info.getValue()}</div>
          <div className="text-xs text-gray-500">
            Price: {info.row.original.surface_unit_price.toLocaleString()} FCFA
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("price_per_kilometer", {
      header: "Price/Km (FCFA)",
      cell: (info) =>
        editingId === info.row.original.id ? (
          <input
            type="number"
            min="0"
            step="100"
            defaultValue={info.row.original.price_per_kilometer}
            ref={(el) => (inputRefs.current.price_per_kilometer = el)}
            className="w-24 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) =>
              e.key === "Enter" && handleSave(info.row.original.id)
            }
          />
        ) : (
          <span>{info.getValue().toLocaleString()} FCFA</span>
        ),
    }),
    columnHelper.accessor("price_per_hour", {
      header: "Price/Hour (FCFA)",
      cell: (info) =>
        editingId === info.row.original.id ? (
          <input
            type="number"
            min="0"
            step="100"
            defaultValue={info.row.original.price_per_hour}
            ref={(el) => (inputRefs.current.price_per_hour = el)}
            className="w-24 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) =>
              e.key === "Enter" && handleSave(info.row.original.id)
            }
          />
        ) : (
          <span>{info.getValue().toLocaleString()} FCFA</span>
        ),
    }),
    columnHelper.accessor("equipments_price", {
      header: "Equipment Price (FCFA)",
      cell: (info) =>
        editingId === info.row.original.id ? (
          <input
            type="number"
            min="0"
            step="100"
            defaultValue={info.row.original.equipments_price}
            ref={(el) => (inputRefs.current.equipments_price = el)}
            className="w-24 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) =>
              e.key === "Enter" && handleSave(info.row.original.id)
            }
          />
        ) : (
          <span>{info.getValue().toLocaleString()} FCFA</span>
        ),
    }),
    columnHelper.accessor("advantages_reduction", {
      header: "Advantage Reduction (%)",
      cell: (info) =>
        editingId === info.row.original.id ? (
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            defaultValue={info.row.original.advantages_reduction}
            ref={(el) => (inputRefs.current.advantages_reduction = el)}
            className="w-24 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) =>
              e.key === "Enter" && handleSave(info.row.original.id)
            }
          />
        ) : (
          <span>{info.getValue().toFixed(1)}%</span>
        ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          {editingId === row.original.id ? (
            <>
              <button
                onClick={() => handleSave(row.original.id)}
                className="text-green-600 hover:text-green-800 transition-colors"
                title="Save"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="text-red-600 hover:text-red-800 transition-colors"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleEdit(row.original)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    }),
  ], [editingId, handleEdit, handleSave, handleCancel]);

  // Create dynamic pricing table
  const dynamicPricingTable = useReactTable({
    data: dynamicPricings,
    columns: dynamicPricingColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  if (loadingPricing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg text-gray-700">Loading pricing data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dynamic Pricing Configuration
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Configure base prices and dynamic pricing rules
          </p>
        </div>
        
        {/* Export Button */}
        <div className="mt-4 sm:mt-0">
          <button
            onClick={exportToExcel}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            disabled={loadingPricing || dynamicPricings.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("base")}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === "base"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-700 dark:text-gray-200 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            Base Pricing Configuration
          </button>
          <button
            onClick={() => setActiveTab("dynamic")}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === "dynamic"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-700 dark:text-gray-200 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            Dynamic Pricing Rules
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "base" ? (
        basePricingTables
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {dynamicPricingTable.getRowModel().rows.length} of{" "}
              {dynamicPricings.length} configurations
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => dynamicPricingTable.previousPage()}
                disabled={!dynamicPricingTable.getCanPreviousPage()}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => dynamicPricingTable.nextPage()}
                disabled={!dynamicPricingTable.getCanNextPage()}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>

          <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-700">
                {dynamicPricingTable.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={`group inline-flex ${
                              header.column.getCanSort()
                                ? "cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
                                : ""
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <span className="ml-2 flex-none rounded">
                                {{
                                  asc: <ChevronUp className="h-4 w-4 text-gray-400" />,
                                  desc: <ChevronDown className="h-4 w-4 text-gray-400" />,
                                }[header.column.getIsSorted() as string] ??
                                  <ChevronDown className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                              </span>
                            )}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800">
                {dynamicPricingTable.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      editingId === row.original.id
                        ? "bg-yellow-50 dark:bg-gray-700"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 dark:text-gray-200"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Page {dynamicPricingTable.getState().pagination.pageIndex + 1} of{" "}
              {dynamicPricingTable.getPageCount()} • Total: {dynamicPricings.length} items
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dynamicPricingTable.setPageIndex(0)}
                disabled={!dynamicPricingTable.getCanPreviousPage()}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                First
              </button>
              <button
                onClick={() => dynamicPricingTable.previousPage()}
                disabled={!dynamicPricingTable.getCanPreviousPage()}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => dynamicPricingTable.nextPage()}
                disabled={!dynamicPricingTable.getCanNextPage()}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
              <button
                onClick={() => dynamicPricingTable.setPageIndex(dynamicPricingTable.getPageCount() - 1)}
                disabled={!dynamicPricingTable.getCanNextPage()}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Last
              </button>
              <select
                value={dynamicPricingTable.getState().pagination.pageSize}
                onChange={(e) =>
                  dynamicPricingTable.setPageSize(Number(e.target.value))
                }
                className="block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {[10, 20, 30, 50, 100].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}