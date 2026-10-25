#!/usr/bin/env python3
"""Prépare les photos d'un véhicule pour le site.
Usage : python3 outils/preparer-photos.py dossier_source [premiere_photo.jpg]
Crée dans images/vehicules/ : m/ (petite, cartes), g/ (grande, fiche), og/ (aperçu WhatsApp, 1ère photo)"""
import sys, os
from PIL import Image, ImageOps
RACINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "images", "vehicules")

def preparer(src, nom, og=False):
    base = os.path.splitext(nom)[0]
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    for dossier, taille, q in (("g", 1200, 78), ("m", 600, 72)):
        os.makedirs(os.path.join(RACINE, dossier), exist_ok=True)
        c = im.copy(); c.thumbnail((taille, taille), Image.LANCZOS)
        c.save(os.path.join(RACINE, dossier, base + ".webp"), "WEBP", quality=q, method=6)
    if og:
        os.makedirs(os.path.join(RACINE, "og"), exist_ok=True)
        w, h = im.size; cible = 1200 / 630
        if w / h > cible: nw, nh = int(h * cible), h
        else: nw, nh = w, int(w / cible)
        # recadrage centré légèrement vers le haut (la voiture reste visible)
        x, y = (w - nw) // 2, max(0, int((h - nh) * 0.4))
        c = im.crop((x, y, x + nw, y + nh)).resize((1200, 630), Image.LANCZOS)
        c.save(os.path.join(RACINE, "og", base + ".jpg"), "JPEG", quality=80, optimize=True)

if __name__ == "__main__":
    dossier = sys.argv[1]; premiere = sys.argv[2] if len(sys.argv) > 2 else None
    for f in sorted(os.listdir(dossier)):
        if f.lower().endswith((".jpg", ".jpeg", ".png")):
            preparer(os.path.join(dossier, f), f, og=(f == premiere))
