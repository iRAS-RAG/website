import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSpecies } from "../../../api/species";
import { getTankRecommendedInitials, getTanks } from "../../../api/tanks";
import useBatches from "../../../hooks/useBatches";
import type { Species } from "../../../types/species";
import type { Tank } from "../../../types/tank";
import LocalizedDateField from "../../common/LocalizedDateField.tsx";
import { useToast } from "../../common/toastContext";

// Helpers
const formatDateDDMMYYYY = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const getAutoSuggestedName = (speciesName?: string, dateStr?: string) => {
  const formatted = formatDateDDMMYYYY(dateStr || "");
  if (speciesName) {
    const nameLower = speciesName.trim().toLowerCase();
    return `Vụ nuôi ${nameLower} ${formatted}`;
  }
  return `Vụ nuôi ${formatted}`;
};

type CreateBatchDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const CreateBatchDialog: React.FC<CreateBatchDialogProps> = ({ open, onClose, onSuccess }) => {
  const toast = useToast();
  const { createBatch } = useBatches({ autoLoad: false });
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [batchName, setBatchName] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedTank, setSelectedTank] = useState("");
  const [initialQuantity, setInitialQuantity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [isBatchNameEdited, setIsBatchNameEdited] = useState(false);

  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recommendedInitials, setRecommendedInitials] = useState<Record<string, number | null>>({});
  const [recommendedLoading, setRecommendedLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const today = new Date();
    const isoDate = today.toISOString().split("T")[0];

    // Reset form values (auto-suggested name + defaults)
    setStartDate(isoDate);
    setBatchName(getAutoSuggestedName(undefined, isoDate));
    setIsBatchNameEdited(false);
    setSelectedSpecies("");
    setSelectedTank("");
    setInitialQuantity("");
    setErrors({});

    // Load species and tanks
    (async () => {
      setLoading(true);
      try {
        const [configsData, tanksData] = await Promise.all([
          getSpecies().catch((err) => {
            console.error("Lỗi lấy danh sách loài:", err);
            return [];
          }),
          getTanks().catch((err) => {
            console.error("Lỗi lấy danh sách bể:", err);
            return [];
          }),
        ]);

        setSpeciesList(configsData || []);
        setTanks(tanksData || []);
      } catch (error) {
        console.error("Lỗi nghiêm trọng khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  // No estimated harvest date validation required anymore; backend plans stages

  const fetchRecommendedInitialsForTank = async (tankId: string) => {
    if (!tankId) {
      setRecommendedInitials({});
      return;
    }
    setRecommendedLoading(true);
    try {
      const map = await getTankRecommendedInitials(tankId);
      setRecommendedInitials(map || {});
    } catch (err) {
      console.error("Lỗi lấy mức khuyến nghị ban đầu:", err);
      setRecommendedInitials({});
    } finally {
      setRecommendedLoading(false);
    }
  };

  // Auto-update the batch name when species or start date changes,
  // but only if the user hasn't manually edited the name.
  useEffect(() => {
    if (isBatchNameEdited) return;
    const species = speciesList.find((s) => s.id === selectedSpecies);
    const speciesName = species ? species.name : undefined;
    const autoName = getAutoSuggestedName(speciesName, startDate);
    setBatchName(autoName);
  }, [selectedSpecies, startDate, speciesList, isBatchNameEdited]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!batchName.trim()) newErrors.batchName = "Tên vụ nuôi là bắt buộc";
    if (!selectedSpecies) newErrors.config = "Vui lòng chọn loài";
    if (!selectedTank) newErrors.tank = "Vui lòng chọn bể nuôi";
    if (!startDate) newErrors.startDate = "Ngày bắt đầu là bắt buộc";

    // Kiểm tra chặn lúc bấm Submit
    // no estimated harvest date validation — backend determines stages

    const quantity = parseInt(initialQuantity);
    if (!initialQuantity || isNaN(quantity) || quantity <= 0) {
      newErrors.initialQuantity = "Vui lòng nhập số lượng hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return; // Không cần hiện toast vì lỗi đỏ đã hiện rõ ở các field
    }

    setSubmitting(true);
    try {
      const newBatch = await createBatch({
        name: batchName,
        fishTankId: selectedTank,
        speciesId: selectedSpecies,
        startDate: new Date(startDate).toISOString(),
        initialQuantity: parseInt(initialQuantity),
        unitOfMeasure: "con",
      });

      if (newBatch) {
        toast.success("Tạo vụ nuôi thành công");
        // Close dialog and navigate to the batch detail page
        onSuccess();
        onClose();
        navigate(`/supervisor/batches/${newBatch.id}`);
      }
    } catch (error) {
      console.error("Failed to create batch:", error);

      // Try to extract a helpful message from various error shapes returned by apiFetch/axios
      const apiErr = error as {
        message?: string;
        status?: number;
        data?: unknown;
        response?: { data?: unknown };
      };

      let backendMessage: string | undefined;

      // Prefer axios-style response payload (error.response.data) or apiFetch's err.data
      const respData = apiErr.response?.data ?? apiErr.data;
      if (respData) {
        if (typeof respData === "string") {
          backendMessage = respData;
        } else if (typeof respData === "object" && respData !== null) {
          const rd = respData as Record<string, unknown>;
          if (typeof rd.message === "string") backendMessage = rd.message;
          else if (rd.errors) {
            // Try to pick the first validation error message
            try {
              const errs = rd.errors as Record<string, unknown>;
              const first = Object.values(errs).flat?.()[0] ?? Object.values(errs)[0];
              if (typeof first === "string") backendMessage = first;
            } catch {
              /* ignore */
            }
          }
        }
      }

      // Fallback to generic message if available and not generic axios text
      if (!backendMessage && apiErr.message && !apiErr.message.toLowerCase().includes("request failed")) {
        backendMessage = apiErr.message;
      }

      if (backendMessage) {
        // Surface server validation to the user inline on the quantity field
        setErrors((prev) => ({ ...prev, initialQuantity: backendMessage }));
        //toast.error(backendMessage);
      } else {
        toast.error("Không thể tạo vụ nuôi. Bể này có thể đang được sử dụng!");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (reason: "backdropClick" | "escapeKeyDown") => {
    if (reason === "backdropClick") return;
    onClose();
  };

  const recommendedMax = selectedSpecies ? recommendedInitials[selectedSpecies] : undefined;
  const recommendedSuggested = typeof recommendedMax === "number" && recommendedMax > 0 ? Math.ceil(recommendedMax / 2) : undefined;
  const initialQuantityNumber = initialQuantity ? parseInt(initialQuantity, 10) : NaN;
  const isInitialQuantityBelowMin = typeof recommendedSuggested === "number" && !isNaN(initialQuantityNumber) && initialQuantityNumber < recommendedSuggested;
  const isInitialQuantityAboveMax = typeof recommendedMax === "number" && !isNaN(initialQuantityNumber) && initialQuantityNumber > recommendedMax;

  let initialQuantityHelper = errors.initialQuantity || "Số lượng cá giống";
  if (!errors.initialQuantity && selectedSpecies) {
    if (recommendedLoading) {
      initialQuantityHelper = "Đang lấy gợi ý...";
    } else if (typeof recommendedSuggested === "number" && typeof recommendedMax === "number") {
      initialQuantityHelper = `Phạm vi hợp lệ: ${recommendedSuggested} - ${recommendedMax} con`;
    } else if (typeof recommendedMax === "number") {
      initialQuantityHelper = `Tối đa: ${recommendedMax} con`;
    } else {
      initialQuantityHelper = "Không có khuyến nghị cho loài này ở bể đã chọn";
    }
  }
  const showExplanatoryHelperGreen = !errors.initialQuantity && !!selectedSpecies && !recommendedLoading && !isInitialQuantityBelowMin && !isInitialQuantityAboveMax;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" disableEscapeKeyDown={submitting}>
      <DialogTitle sx={{ fontWeight: 700 }}>Tạo vụ nuôi mới</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            <TextField
              fullWidth
              label="Tên/Mã vụ nuôi"
              value={batchName}
              onChange={(e) => {
                setBatchName(e.target.value);
                setIsBatchNameEdited(true);
              }}
              error={!!errors.batchName}
              helperText={errors.batchName || "Tự động sinh hoặc nhập tên tùy chỉnh"}
              required
            />

            <FormControl fullWidth error={!!errors.tank} required>
              <InputLabel>Bể nuôi</InputLabel>
              <Select
                value={selectedTank}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedTank(val);
                  setSelectedSpecies("");
                  setRecommendedInitials({});
                  fetchRecommendedInitialsForTank(val);
                }}
                label="Bể nuôi"
              >
                {tanks.length === 0 ? (
                  <MenuItem disabled value="">
                    <em>Không có bể nuôi nào</em>
                  </MenuItem>
                ) : (
                  tanks.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              <FormHelperText>{errors.tank}</FormHelperText>
            </FormControl>

            <FormControl fullWidth error={!!errors.config} required>
              <InputLabel>Loài</InputLabel>
              <Select value={selectedSpecies} onChange={(e) => setSelectedSpecies(e.target.value)} label="Loài" disabled={!selectedTank}>
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
                        <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                          <Box component="span">{s.name}</Box>
                          <Box component="span" sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
                            {recDisplay}
                          </Box>
                        </Box>
                      </MenuItem>
                    );
                  })
                )}
              </Select>
              <FormHelperText>{errors.config ? errors.config : !selectedTank ? "Vui lòng chọn bể trước để nhận gợi ý" : recommendedLoading ? "Đang lấy gợi ý..." : ""}</FormHelperText>
            </FormControl>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                fullWidth
                sx={{ flex: 2 }}
                type="number"
                label="Số lượng ban đầu"
                value={initialQuantity}
                onChange={(e) => setInitialQuantity(e.target.value)}
                error={!!errors.initialQuantity}
                helperText={initialQuantityHelper}
                FormHelperTextProps={showExplanatoryHelperGreen ? { sx: { color: "success.main" } } : undefined}
                inputProps={{ min: recommendedSuggested ?? 1, step: 1 }}
                required
              />

              <TextField
                fullWidth
                sx={{
                  flex: 1,
                  "& .MuiInputBase-input": {
                    color: "#1E293B",
                    fontWeight: 500,
                    cursor: "default",
                  },
                  "& .MuiOutlinedInput-root": { backgroundColor: "#F8FAFC" },
                }}
                label="Đơn vị tính"
                value="Con"
                InputProps={{ readOnly: true }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <LocalizedDateField label="Ngày bắt đầu" value={startDate} onChange={setStartDate} error={!!errors.startDate} helperText={errors.startDate} required sx={{ flex: 1 }} />
              {/* Estimated harvest date is no longer required; backend plans stages */}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting} sx={{ color: "text.secondary" }}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || submitting || isInitialQuantityBelowMin || isInitialQuantityAboveMax || !!errors.estimatedHarvestDate} // Disable nếu ngày bị lỗi hoặc số lượng nằm ngoài phạm vi hợp lệ
          startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          sx={{
            bgcolor: "#2A85FF",
            "&:hover": { bgcolor: "#1F6FDB" },
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {submitting ? "Đang tạo..." : "Tạo vụ nuôi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateBatchDialog;
