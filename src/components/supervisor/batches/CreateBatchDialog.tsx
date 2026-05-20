import SaveIcon from "@mui/icons-material/Save";
import {
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
import React, { useEffect, useState } from "react";
import { getSpeciesStageConfigs } from "../../../api/species-stage-configs";
import { getTanks } from "../../../api/tanks";
import { useToast } from "../../common/toastContext";
import useBatches from "../../../hooks/useBatches";
import type { SpeciesStageConfig } from "../../../types/species-stage-config";
import type { Tank } from "../../../types/tank";

type CreateBatchDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const CreateBatchDialog: React.FC<CreateBatchDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const { createBatch } = useBatches({ autoLoad: false });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [batchName, setBatchName] = useState("");
  const [selectedConfig, setSelectedConfig] = useState("");
  const [selectedTank, setSelectedTank] = useState("");
  const [initialQuantity, setInitialQuantity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [estimatedHarvestDate, setEstimatedHarvestDate] = useState("");

  const [speciesStageConfigs, setSpeciesStageConfigs] = useState<
    SpeciesStageConfig[]
  >([]);
  const [tanks, setTanks] = useState<Tank[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      resetForm();
      loadData();
    }
  }, [open]);

  // TÍNH NĂNG MỚI: Theo dõi và Validate Real-time Ngày tháng
  useEffect(() => {
    if (startDate && estimatedHarvestDate) {
      const start = new Date(startDate);
      const end = new Date(estimatedHarvestDate);

      // Nếu ngày kết thúc <= ngày bắt đầu -> Báo lỗi ngay lập tức
      if (end <= start) {
        setErrors((prev) => ({
          ...prev,
          estimatedHarvestDate: "Ngày thu hoạch phải lớn hơn ngày bắt đầu",
        }));
      } else {
        // Nếu đã sửa đúng -> Xóa lỗi
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.estimatedHarvestDate;
          return newErrors;
        });
      }
    }
  }, [startDate, estimatedHarvestDate]);

  const resetForm = () => {
    const today = new Date();
    const timestamp = today.toISOString().split("T")[0].replace(/-/g, "");

    setBatchName(`BATCH-${timestamp}`);
    setStartDate(today.toISOString().split("T")[0]);

    const defaultHarvest = new Date();
    defaultHarvest.setMonth(defaultHarvest.getMonth() + 6);
    setEstimatedHarvestDate(defaultHarvest.toISOString().split("T")[0]);

    setSelectedConfig("");
    setSelectedTank("");
    setInitialQuantity("");
    setErrors({});
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [configsData, tanksData] = await Promise.all([
        getSpeciesStageConfigs().catch((err) => {
          console.error("Lỗi lấy cấu hình loài:", err);
          return [];
        }),
        getTanks().catch((err) => {
          console.error("Lỗi lấy danh sách bể:", err);
          return [];
        }),
      ]);

      setSpeciesStageConfigs(configsData || []);
      setTanks(tanksData || []);
    } catch (error) {
      console.error("Lỗi nghiêm trọng khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!batchName.trim()) newErrors.batchName = "Tên vụ nuôi là bắt buộc";
    if (!selectedConfig)
      newErrors.config = "Vui lòng chọn cấu hình loài/giai đoạn";
    if (!selectedTank) newErrors.tank = "Vui lòng chọn bể nuôi";
    if (!startDate) newErrors.startDate = "Ngày bắt đầu là bắt buộc";

    // Kiểm tra chặn lúc bấm Submit
    if (!estimatedHarvestDate) {
      newErrors.estimatedHarvestDate = "Ngày dự kiến thu hoạch là bắt buộc";
    } else if (startDate) {
      const start = new Date(startDate);
      const end = new Date(estimatedHarvestDate);
      if (end <= start) {
        newErrors.estimatedHarvestDate =
          "Ngày thu hoạch phải lớn hơn ngày bắt đầu";
      }
    }

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
        speciesStageConfigId: selectedConfig,
        startDate: startDate,
        estimatedHarvestDate: estimatedHarvestDate,
        initialQuantity: parseInt(initialQuantity),
        unitOfMeasure: "con",
      });

      if (newBatch) {
        toast.success("Tạo vụ nuôi thành công");
        onSuccess();
        onClose();
      }
    } catch (error) {
      // Bỏ chữ ': any' đi
      console.error("Failed to create batch:", error);

      // Định nghĩa hình dáng object lỗi mà ta kỳ vọng từ Backend/Axios/Fetch
      type ApiError = {
        message?: string;
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      // Ép kiểu an toàn (Type Assertion)
      const err = error as ApiError;

      // Lấy thông báo lỗi
      const backendMessage = err?.message || err?.response?.data?.message;

      if (backendMessage) {
        toast.error(backendMessage);
      } else {
        toast.error("Không thể tạo vụ nuôi. Bể này có thể đang được sử dụng!");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (
    event: unknown,
    reason: "backdropClick" | "escapeKeyDown",
  ) => {
    if (reason === "backdropClick") return;
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      disableEscapeKeyDown={submitting}
    >
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
              onChange={(e) => setBatchName(e.target.value)}
              error={!!errors.batchName}
              helperText={
                errors.batchName || "Tự động sinh hoặc nhập tên tùy chỉnh"
              }
              required
            />

            <FormControl fullWidth error={!!errors.config} required>
              <InputLabel>Loài và giai đoạn phát triển</InputLabel>
              <Select
                value={selectedConfig}
                onChange={(e) => setSelectedConfig(e.target.value)}
                label="Loài và giai đoạn phát triển"
              >
                {speciesStageConfigs.length === 0 ? (
                  <MenuItem disabled value="">
                    <em>Không có dữ liệu cấu hình loài</em>
                  </MenuItem>
                ) : (
                  speciesStageConfigs.map((config) => (
                    <MenuItem key={config.id} value={config.id}>
                      {config.speciesName} - {config.growthStageName}
                    </MenuItem>
                  ))
                )}
              </Select>
              <FormHelperText>{errors.config}</FormHelperText>
            </FormControl>

            <FormControl fullWidth error={!!errors.tank} required>
              <InputLabel>Bể nuôi</InputLabel>
              <Select
                value={selectedTank}
                onChange={(e) => setSelectedTank(e.target.value)}
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
                helperText={errors.initialQuantity || "Số lượng cá giống"}
                inputProps={{ min: 1, step: 1 }}
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
                value="Con (cá)"
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
              <TextField
                fullWidth
                sx={{ flex: 1 }}
                type="date"
                label="Ngày bắt đầu"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                error={!!errors.startDate}
                helperText={errors.startDate}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                sx={{ flex: 1 }}
                type="date"
                label="Ngày dự kiến thu hoạch"
                value={estimatedHarvestDate}
                onChange={(e) => setEstimatedHarvestDate(e.target.value)}
                // Hiển thị lỗi màu đỏ ngay lập tức dựa vào state `errors`
                error={!!errors.estimatedHarvestDate}
                helperText={errors.estimatedHarvestDate}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Box>
          </Box>
        )}
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
          disabled={loading || submitting || !!errors.estimatedHarvestDate} // Disable nút lưu nếu ngày đang bị lỗi
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
          {submitting ? "Đang tạo..." : "Tạo vụ nuôi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateBatchDialog;
