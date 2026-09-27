# Website address update — September 27, 2026

The website now displays **sfaitour.com** as its intended address, replacing **aisftour.com**. The AI SF Tour brand name is unchanged. The user's message listed both addresses; sfaitour.com is the working interpretation of the requested replacement, pending any correction.

## Connection status

- Public DNS lookups for both addresses returned NXDOMAIN on September 27. This does not establish domain ownership or availability for purchase.
- No domain was purchased, no DNS records were changed, and no custom-domain connection was activated by this copy update.
- GitHub Pages remains the selected public host. Its Source setting must be GitHub Actions; the branch-based README publisher otherwise competes with the website deployment.
- The current deployed-origin configuration, canonical link and calendar destination remain on the existing review URLs until a custom domain actually works. Existing calendar UIDs retain their original namespace to avoid duplicate imported events.

## Complete the domain change

1. Confirm control of sfaitour.com and access to its DNS provider. Confirm separately whether aisftour.com should also be owned and redirected.
2. Fix the GitHub Pages source setting, then configure the chosen custom domain and its required DNS records using the host's current instructions.
3. Update the static build's base path for the new root-domain deployment, including its canonical URL, asset paths, navigation, calendar links and home-screen/offline behavior. The current build is scoped to /tourguide/.
4. Verify HTTPS and anonymous access, then update live-origin settings for any separately hosted booking backend. Keep sales closed until the existing payment and operating checks pass.
5. Regenerate printed banners, brochures and QR artwork for the verified destination. Earlier PDFs and QR materials still contain aisftour.com and must be reviewed before public printing.
