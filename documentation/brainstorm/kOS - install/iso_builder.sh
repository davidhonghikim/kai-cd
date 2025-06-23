#!/bin/bash
# ==============================================
# kOS ISO Builder
# ==============================================
# Creates a bootable ISO image with preloaded agent stack
# Works with Ventoy, PXE boot, or direct flash
# ==============================================

set -e

ISO_NAME="kos_boot.iso"
WORKDIR="/tmp/kos_iso_build"
KOS_REPO="https://github.com/kind-os/kOS.git"

# --- Prepare Build Directory ---
echo "[kOS] 🧰 Creating ISO build workspace..."
sudo rm -rf $WORKDIR
mkdir -p $WORKDIR
cd $WORKDIR

# --- Clone or Copy kOS System ---
echo "[kOS] 📦 Fetching kOS repo..."
git clone $KOS_REPO . || cp -r /opt/kos/* .

# --- Run model/data bootstrap ---
echo "[kOS] 📦 Preloading models and workflows..."
bash bootstrap_data.sh || echo "[WARN] Continue without full bootstrap"

# --- Build ISO ---
echo "[kOS] 🔧 Building ISO..."
sudo apt install -y xorriso isolinux syslinux-utils
mkdir -p iso/boot
cp -r * iso/
cp /usr/lib/ISOLINUX/isolinux.bin iso/boot/
cp /usr/lib/syslinux/modules/bios/* iso/boot/
echo 'default kos
label kos
  kernel /boot/vmlinuz
  append initrd=/boot/initrd.img boot=live quiet' > iso/isolinux.cfg

xorriso -as mkisofs \
  -o $ISO_NAME \
  -b boot/isolinux.bin \
  -c boot/boot.cat \
  -no-emul-boot -boot-load-size 4 -boot-info-table \
  iso/

# --- Done ---
echo "[kOS] ✅ ISO ready: $WORKDIR/$ISO_NAME"
echo "[kOS] Flash with Ventoy, Etcher, or PXE boot"