package core

import (
	"fmt"
	"os/exec"
	"strings"

	"gopkg.in/ini.v1"
)

func verifySambaConfig() {
	cfg, err := ini.Load(sambaConfigPath)
	if err != nil {
		panic(err.Error())
	}

	existSharedDir := cfg.HasSection("Carpeta Compartida")
	if !existSharedDir {
		sharedSection, err := cfg.NewSection("Carpeta Compartida")
		if err != nil {
			panic(err.Error())
		}

		sharedSection.NewKey("comment", "Carpeta Compartida")
		sharedSection.NewKey("path", sharedDirPath)
		sharedSection.NewKey("browsable", "yes")
		sharedSection.NewKey("writeable", "yes")
		sharedSection.NewKey("guest ok", "no")
		sharedSection.NewKey("valid users", "@lc")

		err = cfg.SaveTo(sambaConfigPath)
		if err != nil {
			panic(err.Error())
		}
	}
}

type SambaManager struct{}

func (sm *SambaManager) BelongsTo(name string) bool {
	if err := validateAccountName(name); err != nil {
		return false
	}

	cfg, err := ini.Load(sambaConfigPath)
	if err != nil {
		return false
	}

	return cfg.HasSection(name)
}

func (sm *SambaManager) Put(name, password string) error {
	if err := validateAccountName(name); err != nil {
		return err
	}
	cfg, err := ini.Load(sambaConfigPath)
	if err != nil {
		return err
	}

	existSection := cfg.HasSection(name)
	if !existSection {
		newSection, err := cfg.NewSection(name)
		if err != nil {
			return err
		}

		newSection.NewKey("comment", fmt.Sprintf("Directorio de %s", name))
		newSection.NewKey("path", fmt.Sprintf("/home/%s", name))
		newSection.NewKey("browsable", "yes")
		newSection.NewKey("writable", "yes")
		newSection.NewKey("guest ok", "no")
		newSection.NewKey("valid users", name)
		newSection.NewKey("write list", name)
		newSection.NewKey("read only", "yes")

		err = cfg.SaveTo(sambaConfigPath)
		if err != nil {
			return err
		}

		cmd := exec.Command(sambaBinPath, "-a", name)
		input := strings.NewReader(password + "\n" + password + "\n")
		cmd.Stdin = input

		output, err := cmd.CombinedOutput()
		if err := commandOutputError(cmd, output, err); err != nil {
			return err
		}
	}
	return nil
}

func (sm *SambaManager) Delete(name string) error {
	if err := validateAccountName(name); err != nil {
		return err
	}
	cfg, err := ini.Load(sambaConfigPath)
	if err != nil {
		return err
	}

	existSection := cfg.HasSection(name)
	if existSection {
		cfg.DeleteSection(name)

		err = cfg.SaveTo(sambaConfigPath)
		if err != nil {
			return err
		}

		cmd := exec.Command(sambaBinPath, "-x", name)
		output, err := cmd.CombinedOutput()
		if err := commandOutputError(cmd, output, err); err != nil {
			return err
		}
	}
	return nil
}

func (sm *SambaManager) SetPassword(name string, password string) error {
	if err := validateAccountName(name); err != nil {
		return err
	}
	cmd := exec.Command(sambaBinPath, name)
	input := strings.NewReader(password + "\n" + password + "\n")
	cmd.Stdin = input

	output, err := cmd.CombinedOutput()
	if err := commandOutputError(cmd, output, err); err != nil {
		return err
	}

	return nil
}

func (sm *SambaManager) Enable(name string) error {
	if err := validateAccountName(name); err != nil {
		return err
	}
	cmd := exec.Command(sambaBinPath, "-e", name)
	output, err := cmd.CombinedOutput()
	if err := commandOutputError(cmd, output, err); err != nil {
		return err
	}
	return nil
}

func (sm *SambaManager) Disable(name string) error {
	if err := validateAccountName(name); err != nil {
		return err
	}
	cmd := exec.Command(sambaBinPath, "-d", name)
	output, err := cmd.CombinedOutput()
	if err := commandOutputError(cmd, output, err); err != nil {
		return err
	}
	return nil
}
