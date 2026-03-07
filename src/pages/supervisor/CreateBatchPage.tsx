import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, CircularProgress, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Paper, Select, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSpeciesStageConfigs } from "../../api/species-stage-configs";
import { getTanks } from "../../api/tanks";
import { useToast } from "../../components/common/toastContext";
import SupervisorHeader from "../../components/supervisor/SupervisorHeader";
import SupervisorSidebar from "../../components/supervisor/SupervisorSidebar";
import useBatches from "../../hooks/useBatches";
import type { SpeciesStageConfig } from "../../types/species-stage-config";
import type { Tank } from "../../types/tank";

const CreateBatchPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { createBatch } = useBatches({ autoLoad: false });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [batchName, setBatchName] = useState("");
  const [selectedConfig, setSelectedConfig] = useState("");
  const [selectedTank, setSelectedTank] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [estimatedHarvestDate, setEstimatedHarvestDate] = useState("");
  const [initialQuantity, setInitialQuantity] = useState("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("con");

  // Dropdown options
  const [speciesStageConfigs, setSpeciesStageConfigs] = useState<SpeciesStageConfig[]>([]);
  const [tanks, setTanks] = useState<Tank[]>([]);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load dropdown data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [configsData, tanksData] = await Promise.all([getSpeciesStageConfigs(), getTanks()]);
        setSpeciesStageConfigs(configsData);
        setTanks(tanksData);

        // Generate default batch name
        const timestamp = new Date().toISOString().split("T")[0].replace(/-/g, "");
        setBatchName(`BATCH-${timestamp}`);

        // Set default harvest date (6 months from start)
        const defaultHarvest = new Date();
        defaultHarvest.setMonth(defaultHarvest.getMonth() + 6);
        setEstimatedHarvestDate(defaultHarvest.toISOString().split("T")[0]);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Không thể tải dữ liệu biểu mẫu");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!batchName.trim()) newErrors.batchName = "Tên vụ nuôi là bắt buộc";
    if (!selectedConfig) newErrors.config = "Vui lòng chọn cấu hình loài/giai đoạn";
    if (!selectedTank) newErrors.tank = "Vui lòng chọn bể nuôi";
    if (!startDate) newErrors.startDate = "Ngày bắt đầu là bắt buộc";
    if (!estimatedHarvestDate) newErrors.estimatedHarvestDate = "Ngày dự kiến thu hoạch là bắt buộc";

    const quantity = parseInt(initialQuantity);
    if (!initialQuantity || isNaN(quantity) || quantity <= 0) {
      newErrors.initialQuantity = "Vui lòng nhập số lượng hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại thông tin nhập");
      return;
    }

    setSubmitting(true);
    try {
      const newBatch = await createBatch({
        name: batchName,
        fishTankId: selectedTank,
        speciesStageConfigId: selectedConfig,
        startDate,
        estimatedHarvestDate,
        initialQuantity: parseInt(initialQuantity),
        unitOfMeasure,
      });

      if (newBatch) {
        toast.success("Tạo vụ nuôi thành công");
        navigate(`/supervisor/batches/${newBatch.id}`);
      }
    } catch (error) {
      console.error("Failed to create batch:", error);
      toast.error("Không thể tạo vụ nuôi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", bgcolor: "background.default", minHeight: "100vh", width: "100%" }}>
      <SupervisorSidebar />
      <Box sx={{ flexGrow: 1, ml: "240px", display: "flex", flexDirection: "column", minWidth: 0 }}>
        <SupervisorHeader />
        <Box component="main" sx={{ p: 3, flexGrow: 1 }}>
          <Box sx={{ maxWidth: 900, mx: "auto" }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/supervisor/batches")} sx={{ mb: 2 }}>
                Quay lại danh sách vụ nuôi
              </Button>
              <Typography variant="h4" fontWeight={700}>
                Tạo vụ nuôi mới
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Khởi tạo một chu kỳ nuôi mới bằng cách nhập thông tin bên dưới
              </Typography>
            </Box>

            {/* Form */}
            <Paper sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Batch Name */}
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Tên/Mã vụ nuôi"
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      error={!!errors.batchName}
                      helperText={errors.batchName || "Tự động sinh hoặc nhập tên tùy chỉnh"}
                      required
                    />
                  </Grid>

                  {/* Species/Stage Config */}
                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth error={!!errors.config} required>
                      <InputLabel>Loài và giai đoạn phát triển</InputLabel>
                      <Select value={selectedConfig} onChange={(e) => setSelectedConfig(e.target.value)} label="Loài và giai đoạn phát triển">
                        {speciesStageConfigs.map((config) => (
                          <MenuItem key={config.id} value={config.id}>
                            {config.speciesName} - {config.growthStageName}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.config && <FormHelperText>{errors.config}</FormHelperText>}
                      {!errors.config && <FormHelperText>Chọn loài và giai đoạn cho vụ nuôi này</FormHelperText>}
                    </FormControl>
                  </Grid>

                  {/* Tank */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth error={!!errors.tank} required>
                      <InputLabel>Bể nuôi</InputLabel>
                      <Select value={selectedTank} onChange={(e) => setSelectedTank(e.target.value)} label="Bể nuôi">
                        {tanks.map((t) => (
                          <MenuItem key={t.id} value={t.id}>
                            {t.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.tank && <FormHelperText>{errors.tank}</FormHelperText>}
                      {!errors.tank && <FormHelperText>Chọn bể nuôi còn trống cho đợt này</FormHelperText>}
                    </FormControl>
                  </Grid>

                  {/* Unit of Measure */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>Đơn vị tính</InputLabel>
                      <Select value={unitOfMeasure} onChange={(e) => setUnitOfMeasure(e.target.value)} label="Đơn vị tính">
                        <MenuItem value="con">Con (cá)</MenuItem>
                        <MenuItem value="kg">Kg</MenuItem>
                      </Select>
                      <FormHelperText>Chọn đơn vị đo lường</FormHelperText>
                    </FormControl>
                  </Grid>

                  {/* Start Date */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Ngày bắt đầu"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      error={!!errors.startDate}
                      helperText={errors.startDate}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>

                  {/* Estimated Harvest Date */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Ngày dự kiến thu hoạch"
                      value={estimatedHarvestDate}
                      onChange={(e) => setEstimatedHarvestDate(e.target.value)}
                      error={!!errors.estimatedHarvestDate}
                      helperText={errors.estimatedHarvestDate}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>

                  {/* Initial Quantity */}
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Số lượng ban đầu"
                      value={initialQuantity}
                      onChange={(e) => setInitialQuantity(e.target.value)}
                      error={!!errors.initialQuantity}
                      helperText={errors.initialQuantity || "Số lượng cá hoặc khối lượng (kg)"}
                      inputProps={{ min: 1, step: 1 }}
                      required
                    />
                  </Grid>

                  {/* Actions */}
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
                      <Button variant="outlined" onClick={() => navigate("/supervisor/batches")} disabled={submitting}>
                        Hủy
                      </Button>
                      <Button type="submit" variant="contained" startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />} disabled={submitting}>
                        {submitting ? "Đang tạo..." : "Tạo vụ nuôi"}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateBatchPage;
