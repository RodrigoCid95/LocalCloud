package core

import (
	"os/exec"
)

type SystemPower struct{}

func (sp *SystemPower) Shutdown() error {
	return scheduleSystemPowerCommand("poweroff")
}

func (sp *SystemPower) Reboot() error {
	return scheduleSystemPowerCommand("reboot")
}

func scheduleSystemPowerCommand(action string) error {
	cmd := exec.Command("systemctl", "--no-block", action)
	output, err := cmd.CombinedOutput()
	return commandOutputError(cmd, output, err)
}
