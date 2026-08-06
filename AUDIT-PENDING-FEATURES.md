# Audit of Pending Features

## Confirmed Pending
- **Projects Route (PT/EN)**: `config/site.json` has `routes.projects.implemented` set to `false`.
- **Individual Project Routes**: `projectAquaform`, `projectBrasa27`, `projectAtlasVale` are marked `implemented: false`.
- **Services, Process, About, Contact, Lab**: Also marked `implemented: false`.

## Blocked by Data or Credentials
- Contact form endpoint (`formEndpoint: ""`).
- Real emails or WhatsApp links (currently placeholders).
- Real domain (currently base URL is empty or uses Cloudflare Worker URL).

## Safe for Implementation Now
- **Bilingual Projects Route (`/pt/projetos/` and `/en/projects/`)**.
- Does not rely on a backend.
- Can reuse existing content (Aquaform, Brasa 27, Atlas Vale).
- Safe to implement visually and structurally without breaking existing flows.

## Discarded Pending Features
- Backend forms (needs real credentials).
- Deep individual case study pages (we only have summary data for now).

## Chosen Feature and Commercial Justification
**Feature:** Bilingual Projects Route (`/pt/projetos/` and `/en/projects/`).

**Justification:** A dedicated projects page is essential for a creative/development studio like STANDLOUD to showcase their capabilities fully. The home page only shows a glimpse (carousel and single cards), but a dedicated page provides a persistent, shareable portfolio link that adds commercial weight. By explicitly stating these are conceptual projects, we maintain integrity while demonstrating technical and visual competence.
