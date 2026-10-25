---
title: Efter installationen
description: ""
date: 2026-10-22
distro: Fedora
distroVersion: "44"
draft: true
---

<!-- Utkast: disposition och kommandon att verifiera. Skriv texten själv. -->

## Uppdatera systemet

- Varför först
- Kommando att verifiera: `sudo dnf upgrade --refresh`
- Starta om vid ny kärna

## RPM Fusion

- Vad det är och varför det behövs (licensskäl)
- Kommando att verifiera: `dnf install` med `rpmfusion-free-release` och `rpmfusion-nonfree-release` för `$(rpm -E %fedora)`

## Flathub

- Vad Flatpak/Flathub är
- Kommando att verifiera: `flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo`

## Multimedia

- Varför fullständig ffmpeg från RPM Fusion
- Kommandon att verifiera: `dnf swap ffmpeg-free ffmpeg --allowerasing`, `dnf group install multimedia`

## Att lägga till

- Svensk tangentbordslayout och stavningskontroll
- NVIDIA-drivrutiner
- GNOME-tillägg och inställningar
