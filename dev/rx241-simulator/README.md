# RX 2.41 AMOLED Simulator

Browser simulator for the DigiTape RX 2.41 AMOLED UI.

- Panel coordinate system: `450 x 600`, matching the `MiniRX2.41` firmware constants.
- The home screen mirrors the current firmware positions for TX, signal bars, WiFi, battery, distance, offset, and mode.
- The simulator includes Settings, Power, Connection, Diagnostics, WiFi, Brightness, and Debug WiFi pages.
- Use the state controls to test distances, connection states, theme colors, RSSI, battery source, and scale before flashing firmware.

Open with:

This simulator has been archived. Use the active Display Studio at `tools/mini_rx_emulator` instead.

Then go to:

```text
http://127.0.0.1:8767
```

The display surface uses exact RX 2.41 pixels internally. CSS positions intentionally mirror the firmware constants so layout changes can be copied back into `MiniRX2.41.ino`.
