package core

import (
	"fmt"
	"os"
	"runtime"
	"strconv"
	"strings"
	"time"
)

type SystemStatus struct{}

type SystemStatusResult struct {
	CPU SystemCPUStatus `json:"cpu"`
	RAM SystemRAMStatus `json:"ram"`
}

type SystemCPUStatus struct {
	Cores        int       `json:"cores"`
	UsagePercent float64   `json:"usagePercent"`
	LoadAverage  []float64 `json:"loadAverage"`
}

type SystemRAMStatus struct {
	TotalBytes     uint64  `json:"totalBytes"`
	AvailableBytes uint64  `json:"availableBytes"`
	UsedBytes      uint64  `json:"usedBytes"`
	UsagePercent   float64 `json:"usagePercent"`
}

type cpuSample struct {
	idle  uint64
	total uint64
}

func (ss *SystemStatus) Get() (*SystemStatusResult, error) {
	cpu, err := ss.GetCPU()
	if err != nil {
		return nil, err
	}

	ram, err := ss.GetRAM()
	if err != nil {
		return nil, err
	}

	return &SystemStatusResult{
		CPU: *cpu,
		RAM: *ram,
	}, nil
}

func (ss *SystemStatus) GetCPU() (*SystemCPUStatus, error) {
	first, err := readCPUSample()
	if err != nil {
		return nil, err
	}
	time.Sleep(100 * time.Millisecond)
	second, err := readCPUSample()
	if err != nil {
		return nil, err
	}

	usagePercent := 0.0
	if second.total >= first.total && second.idle >= first.idle {
		totalDelta := second.total - first.total
		idleDelta := second.idle - first.idle
		if totalDelta > 0 && totalDelta >= idleDelta {
			usagePercent = float64(totalDelta-idleDelta) / float64(totalDelta) * 100
		}
	}

	return &SystemCPUStatus{
		Cores:        runtime.NumCPU(),
		UsagePercent: roundPercent(usagePercent),
		LoadAverage:  readLoadAverage(),
	}, nil
}

func (ss *SystemStatus) GetRAM() (*SystemRAMStatus, error) {
	values, err := readMemInfo()
	if err != nil {
		return nil, err
	}

	total := values["MemTotal"]
	available := values["MemAvailable"]
	if available == 0 {
		available = values["MemFree"] + values["Buffers"] + values["Cached"]
	}
	if total == 0 {
		return nil, fmt.Errorf("no se pudo leer la memoria total")
	}
	if available > total {
		available = total
	}

	used := total - available
	return &SystemRAMStatus{
		TotalBytes:     total,
		AvailableBytes: available,
		UsedBytes:      used,
		UsagePercent:   roundPercent(float64(used) / float64(total) * 100),
	}, nil
}

func readCPUSample() (cpuSample, error) {
	content, err := os.ReadFile("/proc/stat")
	if err != nil {
		return cpuSample{}, err
	}

	for _, line := range strings.Split(string(content), "\n") {
		if !strings.HasPrefix(line, "cpu ") {
			continue
		}

		fields := strings.Fields(line)
		if len(fields) < 5 {
			return cpuSample{}, fmt.Errorf("formato de /proc/stat no valido")
		}

		var values []uint64
		for _, field := range fields[1:] {
			value, err := strconv.ParseUint(field, 10, 64)
			if err != nil {
				return cpuSample{}, err
			}
			values = append(values, value)
		}

		var total uint64
		for _, value := range values {
			total += value
		}

		idle := values[3]
		if len(values) > 4 {
			idle += values[4]
		}

		return cpuSample{
			idle:  idle,
			total: total,
		}, nil
	}

	return cpuSample{}, fmt.Errorf("no se pudo leer el estado de CPU")
}

func readLoadAverage() []float64 {
	content, err := os.ReadFile("/proc/loadavg")
	if err != nil {
		return []float64{}
	}

	fields := strings.Fields(string(content))
	result := make([]float64, 0, 3)
	for i := 0; i < len(fields) && i < 3; i++ {
		value, err := strconv.ParseFloat(fields[i], 64)
		if err != nil {
			return []float64{}
		}
		result = append(result, value)
	}

	return result
}

func readMemInfo() (map[string]uint64, error) {
	content, err := os.ReadFile("/proc/meminfo")
	if err != nil {
		return nil, err
	}

	values := map[string]uint64{}
	for _, line := range strings.Split(string(content), "\n") {
		parts := strings.Fields(line)
		if len(parts) < 2 {
			continue
		}

		key := strings.TrimSuffix(parts[0], ":")
		value, err := strconv.ParseUint(parts[1], 10, 64)
		if err != nil {
			return nil, err
		}

		values[key] = value * 1024
	}

	return values, nil
}

func roundPercent(value float64) float64 {
	return float64(int(value*100+0.5)) / 100
}
