import SaveIcon from "@mui/icons-material/Save";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { getSpecies } from "../../../api/species";
import { getSpeciesStageConfigsBySpecies } from "../../../api/species-stage-configs";
import { getTankRecommendedInitials } from "../../../api/tanks";
import useBatches from "../../../hooks/useBatches";
import type { Batch } from "../../../types/batch";
import type { Species } from "../../../types/species";
import LocalizedDateField from "../../common/LocalizedDateField.tsx";
import { useToast } from "../../common/toastContext";

type EditBatchDialogProps = {
  batch: Batch;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const EditBatchDialog: React.FC<EditBatchDialogProps> = ({
  batch,
  open,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const { updateBatch, updateBatchSchedule } = useBatches({ autoLoad: false });

  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [batchName, setBatchName] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [initialQuantity, setInitialQuantity] = useState("");
  const [startDate, setStartDate] = useState("");

  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recommendedInitials, setRecommendedInitials] = useState<
    Record<string, number | null>
  >({});
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [estimatedHarvestDate, setEstimatedHarvestDate] = useState<
    string | null
  >(null);
  const [estimatingHarvest, setEstimatingHarvest] = useState(false);

  const isPaused = batch.status === "PAUSED";

  useEffect(() => {
    if (!open) return;

    // Pre-populate form with batch data
    setBatchName(batch.name);
    setSelectedSpecies(batch.speciesId || "");
    setInitialQuantity(String(batch.initialQuantity ?? ""));
    setStartDate(batch.startDate.split("T")[0]);
    setErrors({});

    // Load species
    (async () => {
      try {
        const speciesData = await getSpecies();
        setSpeciesList(speciesData || []);
      } catch (err) {
        console.error("Failed to load species:", err);
      }
    })();

    // Load recommended initials for PAUSED batches
    if (isPaused && batch.fishTankId) {
      setRecommendedLoading(true);
      getTankRecommendedInitials(batch.fishTankId)
        .then((map) => setRecommendedInitials(map || {}))
        .catch(() => setRecommendedInitials({}))
        .finally(() => setRecommendedLoading(false));
    }
  }, [open, batch, isPaused]);

  // Calculate estimated harvest date
  useEffect(() => {
    if (!selectedSpecies || !startDate) {
      setEstimatedHarvestDate(null);
      return;
    }
    setEstimatingHarvest(true);
    (async () => {
      try {
        const stages = await getSpeciesStageConfigsBySpecies(selectedSpecies);
        const totalDays = stages.reduce(
          (sum, s) => sum + (s.expectedDurationDays ?? 0),
          0,
        );
        if (totalDays > 0) {
          const est = dayjs(startDate)
            .add(totalDays, "day")
            .format("DD/MM/YYYY");
          setEstimatedHarvestDate(est);
        } else {
          setEstimatedHarvestDate(null);
        }
      } catch {
        setEstimatedHarvestDate(null);
      } finally {
        setEstimatingHarvest(false);
      }
    })();
  }, [selectedSpecies, startDate]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!batchName.trim()) newErrors.batchName = "Tên vụ nuôi là bắt buộc";

    if (isPaused) {
      if (!selectedSpecies) newErrors.species = "Vui lòng chọn loài";
      if (!startDate) newErrors.startDate = "Ngày bắt đầu là bắt buộc";
      else if (startDate < new Date().toISOString().split("T")[0])
        newErrors.startDate = "Ngày bắt đầu không thể trong quá khứ";

      const quantity = parseInt(initialQuantity);
      if (!initialQuantity || isNaN(quantity) || quantity <= 0) {
        newErrors.initialQuantity = "Vui lòng nhập số lượng hợp lệ";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isPaused) {
        // Update schedule for paused batches
        await updateBatchSchedule(batch.id, {
          startDate: new Date(startDate).toISOString(),
          speciesId: selectedSpecies,
          initialQuantity: parseInt(initialQuantity),
        });
        // Also update name
        if (batchName !== batch.name) {
          await updateBatch(batch.id, {
            name: batchName,
            unitOfMeasure: "con",
          });
        }
      } else {
        // Update basic info for active batches
        await updateBatch(batch.id, { name: batchName, unitOfMeasure: "con" });
      }

      toast.success("Cập nhật vụ nuôi thành công");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update batch:", error);
      toast.error("Không thể cập nhật vụ nuôi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (reason: "backdropClick" | "escapeKeyDown") => {
    if (reason === "backdropClick") return;
    onClose();
  };

  const recommendedMax = selectedSpecies
    ? recommendedInitials[selectedSpecies]
    : undefined;
  const recommendedSuggested =
    typeof recommendedMax === "number" && recommendedMax > 0
      ? Math.ceil(recommendedMax / 2)
      : undefined;
  const initialQuantityNumber = initialQuantity
    ? parseInt(initialQuantity, 10)
    : NaN;
  const isInitialQuantityBelowMin =
    typeof recommendedSuggested === "number" &&
    !isNaN(initialQuantityNumber) &&
    initialQuantityNumber < recommendedSuggested;
  const isInitialQuantityAboveMax =
    typeof recommendedMax === "number" &&
    !isNaN(initialQuantityNumber) &&
    initialQuantityNumber > recommendedMax;

  let initialQuantityHelper =
    errors.initialQuantity || "Số lượng vật nuôi giống";
  if (!errors.initialQuantity && selectedSpecies) {
    if (recommendedLoading) {
      initialQuantityHelper = "Đang lấy gợi ý...";
    } else if (
      typeof recommendedSuggested === "number" &&
      typeof recommendedMax === "number"
    ) {
      initialQuantityHelper = `Phạm vi hợp lệ: ${recommendedSuggested} - ${recommendedMax} con`;
    } else if (typeof recommendedMax === "number") {
      initialQuantityHelper = `Tối đa: ${recommendedMax} con`;
    } else {
      initialQuantityHelper = "Không có khuyến nghị cho loài này ở bể đã chọn";
    }
  }
  const showExplanatoryHelperGreen =
    !errors.initialQuantity &&
    !!selectedSpecies &&
    !recommendedLoading &&
    !isInitialQuantityBelowMin &&
    !isInitialQuantityAboveMax;

  const todayStr = new Date().toISOString().split("T")[0];
  const isStartDateInPast = startDate !== "" && startDate < todayStr;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      disableEscapeKeyDown={submitting}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        Chỉnh sửa thông tin vụ nuôi
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
          {!isPaused && (
            <Alert severity="info" sx={{ mb: 1 }}>
              Chỉ có thể chỉnh sửa tên vụ nuôi khi đang trong trạng thái Đang
              nuôi.
            </Alert>
          )}

          <TextField
            fullWidth
            label="Tên/Mã vụ nuôi"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            error={!!errors.batchName}
            helperText={errors.batchName || "Nhập tên tùy chỉnh"}
            required
          />

          {isPaused && (
            <>
              <FormControl fullWidth error={!!errors.species} required>
                <InputLabel>Loài</InputLabel>
                <Select
                  value={selectedSpecies}
                  onChange={(e) => setSelectedSpecies(e.target.value)}
                  label="Loài"
                >
                  {speciesList.length === 0 ? (
                    <MenuItem disabled value="">
                      <em>Không có dữ liệu loài</em>
                    </MenuItem>
                  ) : (
                    speciesList.map((s) => {
                      const rec = recommendedInitials[s.id];
                      const hasRec = rec !== null && rec !== undefined;
                      const recDisplay = hasRec ? `${rec} (con)` : "N/A";
                      return (
                        <MenuItem key={s.id} value={s.id}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              width: "100%",
                              alignItems: "center",
                            }}
                          >
                            <Box component="span">{s.name}</Box>
                            <Box
                              component="span"
                              sx={{
                                color: "text.secondary",
                                fontSize: "0.9rem",
                              }}
                            >
                              {recDisplay}
                            </Box>
                          </Box>
                        </MenuItem>
                      );
                    })
                  )}
                </Select>
                <FormHelperText>{errors.species}</FormHelperText>
              </FormControl>

              <TextField
                fullWidth
                type="number"
                label="Số lượng ban đầu"
                value={initialQuantity}
                onChange={(e) => setInitialQuantity(e.target.value)}
                error={!!errors.initialQuantity}
                helperText={initialQuantityHelper}
                FormHelperTextProps={
                  showExplanatoryHelperGreen
                    ? { sx: { color: "success.main" } }
                    : undefined
                }
                inputProps={{ min: 1, step: 1 }}
                required
              />
            </>
          )}

          {isPaused && (
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <LocalizedDateField
                label="Ngày bắt đầu"
                value={startDate}
                onChange={setStartDate}
                error={!!errors.startDate || isStartDateInPast}
                helperText={
                  errors.startDate ||
                  (isStartDateInPast
                    ? "Ngày bắt đầu không thể trong quá khứ"
                    : "")
                }
                required
                sx={{ flex: 1 }}
              />
              <TextField
                fullWidth
                label="Ngày thu hoạch dự kiến"
                value={
                  estimatedHarvestDate ||
                  (estimatingHarvest ? "Đang tính..." : "—")
                }
                InputProps={{ readOnly: true }}
                sx={{
                  flex: 1,
                  "& .MuiInputBase-input": {
                    color: estimatedHarvestDate ? "#2A85FF" : "#94A3B8",
                    fontWeight: 600,
                    cursor: "default",
                  },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#F8FAFC",
                  },
                  "& .MuiInputLabel-root": {
                    color: "#64748B",
                  },
                }}
              />
            </Box>
          )}

          {!isPaused && (
            <TextField
              fullWidth
              label="Trạng thái"
              value="Đang nuôi"
              InputProps={{ readOnly: true }}
              sx={{
                "& .MuiInputBase-input": {
                  color: "#1E293B",
                  fontWeight: 500,
                  cursor: "default",
                },
                "& .MuiOutlinedInput-root": { backgroundColor: "#F8FAFC" },
              }}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          disabled={submitting}
          sx={{ color: "text.secondary" }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            submitting || isInitialQuantityAboveMax || isStartDateInPast
          }
          startIcon={
            submitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          sx={{
            bgcolor: "#2A85FF",
            "&:hover": { bgcolor: "#1F6FDB" },
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {submitting ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditBatchDialog;
