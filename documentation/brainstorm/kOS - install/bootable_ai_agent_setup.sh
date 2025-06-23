#!/bin/bash
# ==============================================
# MAKE SYSTEM BOOTABLE FOR PORTABLE OR NETWORK USE
# ==============================================
# This script is to be used in conjunction with the AI Agent Deploy Script
# It configures the system for use on portable media or as a PXE boot image
# ==============================================

set -e

# === 1. Check for root access ===
if [[ "$EUID" -ne 0 ]]; then
  echo "[ERROR] This script must be run as root. Use sudo."
  exit 1
fi

# === 2. Create bootable partition (for USB or other media) ===
read -p "Setup portable/USB bootable environment? (y/n): " PORTABLE
if [[ "$PORTABLE" == "y" ]]; then
  echo "[INFO] Setting up bootable USB image..."
  DEV=$(lsblk -d -o NAME,SIZE | grep -v "loop" | grep -v "sda" | awk '{print $1}' | head -n1)
  if [[ -z "$DEV" ]]; then
    echo "[ERROR] No secondary device found. Abort."
    exit 1
  fi

  echo "[INFO] Writing bootable ISO to /dev/$DEV..."
  wget -O aiagent.iso https://cdimage.ubuntu.com/releases/22.04/release/ubuntu-22.04.4-live-server-amd64.iso
  dd if=aiagent.iso of=/dev/$DEV bs=4M status=progress && sync
  echo "[SUCCESS] Bootable USB created on /dev/$DEV"
fi

# === 3. Setup PXE Bootable Server (optional) ===
read -p "Setup PXE network boot server? (y/n): " PXE
if [[ "$PXE" == "y" ]]; then
  echo "[INFO] Setting up PXE server..."
  apt install -y dnsmasq syslinux pxelinux
  mkdir -p /srv/tftp

  cp /usr/lib/PXELINUX/pxelinux.0 /srv/tftp/
  cp /usr/lib/syslinux/modules/bios/ldlinux.c32 /srv/tftp/

  wget -O /srv/tftp/linux https://mirrors.edge.kernel.org/ubuntu/dists/focal/main/installer-amd64/current/images/netboot/ubuntu-installer/amd64/linux
  wget -O /srv/tftp/initrd.gz https://mirrors.edge.kernel.org/ubuntu/dists/focal/main/installer-amd64/current/images/netboot/ubuntu-installer/amd64/initrd.gz

  cat <<EOF > /srv/tftp/pxelinux.cfg/default
DEFAULT linux
LABEL linux
  KERNEL linux
  APPEND initrd=initrd.gz ---
EOF

  cat <<EOF > /etc/dnsmasq.d/pxe.conf
interface=eth0
port=0
dhcp-range=192.168.0.100,192.168.0.200,12h
dhcp-boot=pxelinux.0
enable-tftp
tftp-root=/srv/tftp
EOF

  systemctl restart dnsmasq
  echo "[SUCCESS] PXE boot server ready on eth0."
fi

# === 4. Finalize ===
echo "[INFO] Bootable setup completed. You can now use this image for portable or network deployment."
