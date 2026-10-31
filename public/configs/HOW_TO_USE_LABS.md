# Tactical Lab Implementation Guide

This repository contains raw Cisco IOS configuration files (`.cfg`) and basic GNS3 project skeletons (`.gns3`).

## 📥 How to use .cfg files in Packet Tracer
1. Open Cisco Packet Tracer and drop a Router (e.g., 2911 or 4331).
2. Go to the **CLI** tab.
3. Enter Global Configuration mode:
   ```bash
   enable
   configure terminal
   ```
4. Copy the contents of the downloaded `.cfg` file and **Paste** it directly into the terminal.
5. Save the configuration:
   ```bash
   end
   write memory
   ```

## 🏗️ How to use .gns3 files
1. Open GNS3.
2. Select **File > Open Project**.
3. Point to the downloaded `.gns3` file. 
4. *Note: You must have the corresponding IOU/IOS images imported into your GNS3 server for the nodes to start.*

## 🧪 Practice Directive
Use these files to mirror the Sentinel Global architecture in your local lab. Verify connectivity using `ping` and inspect protocol status with `show ip route` and `show ip protocols`.
