# Manual test plan

1. Install the module in a Foundry VTT v14 world with PF2e and socketlib enabled. Activate **Darkis GodForge** and confirm there are no console errors.
2. Open the dashboard from the module entry point. Confirm the dark/violet layout, GodForge logo, deity cards, stats, and responsive layout at approximately 1100 px.
3. Select **Tenebris**. Confirm the detail view shows overview, domains, passive bonus, divine ability and visibility tabs.
4. In a PF2e world, verify that the active adapter reports PF2e capabilities and that the generic adapter is selected in another system.
5. Use the public API from the console: `game.modules.get("darkis-godforge").api.getSelectableDeities({})`.
6. Exercise the service scenarios at levels 1, 5, 10, 15 and 20, including daily reset, no uses remaining, an OR grant choice, a boss target, unconscious and dying actors.
7. Before enabling production materialization, verify the installed PF2e deity item schema and replace the marked `TODO(verify)` implementation in the PF2e adapter with the version-specific document operation.
