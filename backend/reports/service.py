import os
from typing import Any, List, Dict
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Flowable


def format_datetime_sig(dt: datetime) -> str:
    if not dt:
        return "N/A"
    return dt.strftime("%d %b %Y, %I:%M:%S %p")


def format_duration_sig(sec: float) -> str:
    if sec is None or sec < 0:
        return "N/A"
    return f"{sec:.2f} sec"


def get_ports_scanned_count(port_range: str) -> int:
    if not port_range:
        return 0
    port_range = port_range.strip().lower()
    if port_range == "common":
        return 5
    parts = port_range.split("-")
    if len(parts) == 2:
        try:
            start = int(parts[0])
            end = int(parts[1])
            if start <= end:
                return end - start + 1
        except ValueError:
            pass
    return len(port_range.split(","))


def get_scan_cves(ports: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    cves = []
    for p in ports:
        service = p.get("service", "").lower()
        version = p.get("version", "")
        version_lower = version.lower()

        if not version or version_lower == "unknown":
            continue

        if "squid" in service or "squid" in version_lower:
            confidence = None
            if "5.0" in version_lower or "5.1" in version_lower or "5.2" in version_lower:
                confidence = "High"
            elif "5." in version_lower:
                confidence = "Low"
                
            if confidence and not any(c["id"] == "CVE-2023-45897" for c in cves):
                cves.append({
                    "id": "CVE-2023-45897",
                    "cvss": 9.8,
                    "severity": "Critical",
                    "description": "The Squid proxy remote code execution flaw allows remote attackers to execute arbitrary code via unverified HTTP requests.",
                    "published_date": "2023-10-15",
                    "references": "https://nvd.nist.gov/vuln/detail/CVE-2023-45897",
                    "mitre": "Exploit Public-Facing Application (T1190), Remote Access Software (T1219)",
                    "confidence": confidence
                })

        if "apache" in service or "apache" in version_lower:
            confidence = None
            if "2.4.48" in version_lower or "2.4.49" in version_lower:
                confidence = "High"
            elif "2.4" in version_lower:
                confidence = "Low"
            
            if confidence and not any(c["id"] == "CVE-2021-40438" for c in cves):
                cves.append({
                    "id": "CVE-2021-40438",
                    "cvss": 7.5,
                    "severity": "High",
                    "description": "Apache HTTP Server mod_proxy SSRF vulnerability allows remote attackers to coerce the server into routing requests to arbitrary endpoints.",
                    "published_date": "2021-09-16",
                    "references": "https://nvd.nist.gov/vuln/detail/CVE-2021-40438",
                    "mitre": "Exploit Public-Facing Application (T1190)",
                    "confidence": confidence
                })

        if "ssh" in service or "ssh" in version_lower:
            confidence = None
            if any(v in version_lower for v in ["8.5", "8.6", "8.7", "8.8", "8.9", "9.0", "9.1", "9.2", "9.3", "9.4", "9.5", "9.6", "9.7"]):
                confidence = "High"
            elif "9.8" not in version_lower:
                confidence = "Low"
                
            if confidence and not any(c["id"] == "CVE-2024-6387" for c in cves):
                cves.append({
                    "id": "CVE-2024-6387",
                    "cvss": 8.1,
                    "severity": "High",
                    "description": "A signal handler race condition vulnerability was found in OpenSSH's server (sshd), allowing unauthenticated remote code execution as root.",
                    "published_date": "2024-07-01",
                    "references": "https://nvd.nist.gov/vuln/detail/CVE-2024-6387",
                    "mitre": "Exploit Public-Facing Application (T1190)",
                    "confidence": confidence
                })
    return cves


class RoundedBadge(Flowable):
    def __init__(self, text: str, color: colors.HexColor, width: int = 200, height: int = 60, avail_width: int = 532):
        Flowable.__init__(self)
        self.width = width
        self.height = height
        self.text = text
        self.color = color
        self.avail_width = avail_width

    def wrap(self, availWidth, availHeight):
        self.avail_width = availWidth
        return (availWidth, self.height)

    def draw(self):
        self.canv.saveState()
        self.canv.setFillColor(self.color)
        x = (self.avail_width - self.width) / 2.0
        y = 0
        self.canv.roundRect(x, y, self.width, self.height, 10, fill=1, stroke=0)
        self.canv.setFillColor(colors.white)
        self.canv.setFont("Helvetica-Bold", 16)
        self.canv.drawCentredString(self.avail_width / 2.0, y + (self.height / 2.0) - 5, self.text)
        self.canv.restoreState()


def build_pdf_report(scan: Any, pdf_path: str) -> None:
    styles = getSampleStyleSheet()
    
    # Custom Typography Styles
    title_style = ParagraphStyle(
        name="ReportTitle",
        parent=styles["Heading1"],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=15,
        alignment=0
    )
    section_style = ParagraphStyle(
        name="SectionHeader",
        parent=styles["Heading2"],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=15,
        spaceAfter=6,
        borderPadding=(0, 0, 2, 0),
        borderColor=colors.HexColor("#CBD5E1"),
        borderWidth=0.5
    )
    body_style = ParagraphStyle(
        name="BodyTextCustom",
        parent=styles["Normal"],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )
    code_style = ParagraphStyle(
        name="CodeTextCustom",
        parent=styles["Normal"],
        fontSize=8,
        leading=10,
        fontName="Helvetica",
        textColor=colors.HexColor("#1E293B"),
    )
    table_header_style = ParagraphStyle(
        name="TableHeader",
        parent=styles["Normal"],
        fontSize=8.5,
        leading=10,
        fontName="Helvetica-Bold",
        textColor=colors.white
    )
    table_cell_style = ParagraphStyle(
        name="TableCell",
        parent=styles["Normal"],
        fontSize=8,
        leading=10,
        fontName="Helvetica",
        textColor=colors.HexColor("#334155")
    )
    table_cell_bold_style = ParagraphStyle(
        name="TableCellBold",
        parent=styles["Normal"],
        fontSize=8,
        leading=10,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#0F172A")
    )

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    story = []
    
    # Extract info safely
    results = scan.results or {}
    hosts = results.get("hosts", [])
    ports = []
    if hosts:
        ports = hosts[0].get("ports", [])
        
    resolved_ip = results.get("resolved_ip", "Unknown")
    resolved_hostname = results.get("resolved_hostname", "Unknown")
    reverse_dns = results.get("reverse_dns", "N/A")
    
    is_reachable = False
    ping_info = results.get("ping")
    if ping_info:
        is_reachable = ping_info.get("reachable", False)
    elif len(ports) > 0:
        is_reachable = True
        
    host_status_text = "Online" if is_reachable else "Offline"
    port_range = results.get("port_range", scan.results.get("port_range", "1-1024") if scan.results else "1-1024")
    threads = results.get("threads", 8)
    
    cves = get_scan_cves(ports)
    highest_cvss = max([c["cvss"] for c in cves]) if cves else 0.0
    
    risk_data = results.get("risk", {})
    risk_score = 0
    if risk_data:
        risk_rating = risk_data.get("level", "Low")
        risk_score = risk_data.get("score", 0)
    else:
        if not is_reachable and len(ports) == 0:
            risk_rating = "Not Assessed"
        elif highest_cvss >= 9.0:
            risk_rating = "High"
            risk_score = 90
        elif highest_cvss >= 7.0:
            risk_rating = "Medium"
            risk_score = 50
        else:
            risk_rating = "Low"
            risk_score = 10

    # Removed cover page logic. Report starts directly.

    # Color definitions
    risk_colors = {
        "High": colors.HexColor("#EF4444"),
        "Medium": colors.HexColor("#F59E0B"),
        "Low": colors.HexColor("#10B981"),
        "Not Assessed": colors.HexColor("#64748B"),
    }
    risk_color = risk_colors.get(risk_rating, colors.HexColor("#64748B"))

    # Section 1: Executive Summary
    story.append(Paragraph("Executive Summary", section_style))
    
    total_scanned = get_ports_scanned_count(port_range)
    
    dangerous_ports_def = {
        21: ("FTP", "credentials transmitted in cleartext over the network"),
        23: ("Telnet", "all traffic including passwords sent unencrypted"),
        3389: ("RDP", "exposed remote desktop increases brute-force and ransomware risk"),
        445: ("SMB", "publicly accessible file sharing is a common ransomware vector"),
        5900: ("VNC", "remote access service increases network exposure"),
        6379: ("Redis", "unauthenticated database access exposes sensitive data"),
        27017: ("MongoDB", "unauthenticated database access exposes sensitive data"),
    }
    
    dangerous_found = []
    medium_found = []
    for p in ports:
        try:
            port_num_str = p.get('port', '0')
            if isinstance(port_num_str, str) and "/" in port_num_str:
                p_num = int(port_num_str.split("/")[0])
            else:
                p_num = int(port_num_str)
        except ValueError:
            p_num = 0
            
        if p_num in dangerous_ports_def:
            dangerous_found.append((p_num, p.get("service", dangerous_ports_def[p_num][0])))
        elif p_num in {80, 5432, 3306, 5900}:
            medium_found.append(p_num)

    if dangerous_found:
        summary_level = "HIGH"
        level_reason = "Immediate remediation of cleartext protocols is recommended."
        action_rec = "Deprecate unencrypted services and restrict open ports"
    elif medium_found:
        summary_level = "MEDIUM"
        level_reason = "Service hardening and access restriction advised."
        action_rec = "Review exposed services and apply strict access controls"
    else:
        summary_level = "LOW"
        level_reason = "Maintain regular monitoring and patch management."
        action_rec = "None required — continue standard vulnerability scanning schedule"

    # Sentence 1: scope
    s1 = f"Security assessment of {scan.target} (IP: {resolved_ip}) completed on {format_datetime_sig(scan.start_time)}. The host is {host_status_text} with {len(ports)} open port(s) identified across {total_scanned} scanned ports."
    
    # Sentence 2: key finding
    if dangerous_found:
        first_pnum, first_svc = dangerous_found[0]
        one_line_risk = dangerous_ports_def[first_pnum][1]
        s2 = f"[HIGH RISK] {first_svc} on port {first_pnum} was detected — {one_line_risk}."
    else:
        s2 = "No high-risk services were detected on the target host."
        
    # Sentence 3: risk score
    s3 = f"Overall risk score: {risk_score}/100 — {summary_level} risk. {level_reason}"
    
    # Sentence 4: CVE status
    if cves:
        s4 = f"{len(cves)} CVE(s) matched to detected service versions (max CVSS: {highest_cvss:.1f})."
    else:
        s4 = "No CVEs matched the detected service versions at time of scan."
        
    # Sentence 5: priority action
    s5 = f"Priority action: {action_rec}."
    
    summary_text = f"{s1} {s2} {s3} {s4} {s5}"

    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 8))

    # Section 2: Host & Scan Metadata Grid
    metadata_data = [
        [
            Paragraph("<b>HOST INFORMATION</b>", table_header_style), 
            "", 
            Paragraph("<b>SCAN SETTINGS</b>", table_header_style), 
            ""
        ],
        [Paragraph("Target Address:", table_cell_bold_style), Paragraph(scan.target, table_cell_style), Paragraph("Scan Type:", table_cell_bold_style), Paragraph("TCP Connect Scan", table_cell_style)],
        [Paragraph("Resolved IP:", table_cell_bold_style), Paragraph(resolved_ip, table_cell_style), Paragraph("Port Range:", table_cell_bold_style), Paragraph(port_range, table_cell_style)],
        [Paragraph("Hostname:", table_cell_bold_style), Paragraph(resolved_hostname, table_cell_style), Paragraph("Scanner Threads:", table_cell_bold_style), Paragraph(str(threads), table_cell_style)],
        [Paragraph("Host Status:", table_cell_bold_style), Paragraph(host_status_text, table_cell_style), Paragraph("Scan Started:", table_cell_bold_style), Paragraph(format_datetime_sig(scan.start_time), table_cell_style)],
        [Paragraph("Reverse DNS:", table_cell_bold_style), Paragraph(reverse_dns, table_cell_style), Paragraph("Scan Completed:", table_cell_bold_style), Paragraph(format_datetime_sig(scan.end_time), table_cell_style)],
    ]
    metadata_table = Table(metadata_data, colWidths=[100, 160, 100, 160])
    metadata_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (1, 0), colors.HexColor("#1E293B")),
        ("BACKGROUND", (2, 0), (3, 0), colors.HexColor("#1E293B")),
        ("SPAN", (0, 0), (1, 0)),
        ("SPAN", (2, 0), (3, 0)),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#E2E8F0")),
        ("PADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(metadata_table)
    story.append(Spacer(1, 10))

    # Section 3: Statistics Grid
    open_count = len(ports)
    if is_reachable:
        closed_count = total_scanned - open_count
        filtered_count = 0
    else:
        closed_count = 0
        filtered_count = total_scanned

    stats_data = [
        [
            Paragraph("<b>Scanned Ports</b>", table_header_style),
            Paragraph("<b>Open Ports</b>", table_header_style),
            Paragraph("<b>Closed Ports</b>", table_header_style),
            Paragraph("<b>Filtered Ports</b>", table_header_style),
            Paragraph("<b>CVEs Found</b>", table_header_style),
            Paragraph("<b>Max CVSS</b>", table_header_style),
            Paragraph("<b>Risk Rating</b>", table_header_style)
        ],
        [
            Paragraph(str(total_scanned), table_cell_style),
            Paragraph(str(open_count), table_cell_style),
            Paragraph(str(closed_count), table_cell_style),
            Paragraph(str(filtered_count), table_cell_style),
            Paragraph(str(len(cves)), table_cell_style),
            Paragraph(f"{highest_cvss:.1f}" if cves else "0.0", table_cell_style),
            Paragraph(f"<b>{risk_rating}</b>", ParagraphStyle(name="RiskVal", parent=table_cell_style, textColor=risk_color))
        ]
    ]
    stats_table = Table(stats_data, colWidths=[74, 74, 74, 74, 74, 74, 76])
    stats_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#334155")),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
        ("PADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(Paragraph("Scan Metrics", section_style))
    story.append(stats_table)
    story.append(Spacer(1, 10))

    # Section 3.5: OS Fingerprint
    os_detection = {}
    if hosts:
        os_detection = hosts[0].get("os_detection", {})
    
    if os_detection.get("detected"):
        story.append(Paragraph("Operating System Fingerprint", section_style))
        os_data = [
            [
                Paragraph("<b>OS Name</b>", table_header_style),
                Paragraph("<b>Vendor</b>", table_header_style),
                Paragraph("<b>Device Type</b>", table_header_style),
                Paragraph("<b>Accuracy</b>", table_header_style),
            ],
            [
                Paragraph(str(os_detection.get("os_name", "Unknown")), table_cell_style),
                Paragraph(str(os_detection.get("vendor", "Unknown")), table_cell_style),
                Paragraph(str(os_detection.get("device_type", "Unknown")), table_cell_style),
                Paragraph(str(os_detection.get("accuracy", "0")) + "%", table_cell_style),
            ]
        ]
        os_table = Table(os_data, colWidths=[133, 133, 133, 133])
        os_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#334155")),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
            ("PADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(os_table)
        
        cpe_val = str(os_detection.get("cpe", "N/A"))
        if cpe_val != "N/A":
            cpe_pstyle = ParagraphStyle(name="CPEStyle", parent=body_style, fontName="Courier", fontSize=8, textColor=colors.HexColor("#475569"))
            story.append(Spacer(1, 4))
            story.append(Paragraph(f"<b>CPE:</b> {cpe_val}", cpe_pstyle))
            
        story.append(Spacer(1, 10))

    # Section 4: Port & Service Details
    def create_section_header(title):
        header_pstyle = ParagraphStyle(name="SubSec", fontName="Helvetica-Bold", fontSize=11, textColor=colors.HexColor("#1e293b"))
        return Table(
            [[Paragraph(title, header_pstyle)]],
            colWidths=[532],
            style=[
                ("LINEBEFORE", (0, 0), (0, 0), 3, colors.HexColor("#3b82f6")),
                ("LEFTPADDING", (0, 0), (0, 0), 6),
                ("TOPPADDING", (0, 0), (0, 0), 0),
                ("BOTTOMPADDING", (0, 0), (0, 0), 0),
            ]
        )

    if ports:
        story.append(create_section_header("Open Ports Summary"))
        story.append(Spacer(1, 10))

        table1_data = [[
            Paragraph("<b>Port</b>", table_header_style),
            Paragraph("<b>Service</b>", table_header_style),
            Paragraph("<b>Version</b>", table_header_style),
            Paragraph("<b>Risk Level</b>", table_header_style),
            Paragraph("<b>CVEs Found</b>", table_header_style),
        ]]
        
        dangerous_ports = {21, 23, 445, 3389, 5900, 6379, 27017}
        t1_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a1d27")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#E2E8F0")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
            ("PADDING", (0, 0), (-1, -1), 5),
        ]

        table2_data = [[
            Paragraph("<b>Port/Service</b>", table_header_style),
            Paragraph("<b>Banner</b>", table_header_style),
        ]]
        t2_styles = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a1d27")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#E2E8F0")),
            ("PADDING", (0, 0), (-1, -1), 5),
            ("BACKGROUND", (1, 1), (1, -1), colors.HexColor("#F8FAFC")), # Light gray for all banner cells
        ]

        mono_style = ParagraphStyle(name="MonoBanner", fontName="Courier", fontSize=9, textColor=colors.HexColor("#1E293B"))
        italic_gray = ParagraphStyle(name="ItalicGray", fontName="Helvetica-Oblique", fontSize=9, textColor=colors.HexColor("#94A3B8"))

        for idx, p in enumerate(ports, start=1):
            port_num_str = p.get('port', '0')
            try:
                if isinstance(port_num_str, str) and "/" in port_num_str:
                    port_num = int(port_num_str.split("/")[0])
                else:
                    port_num = int(port_num_str)
            except ValueError:
                port_num = 0
            
            # Risk Level Logic
            if port_num in dangerous_ports:
                risk_bg = colors.HexColor("#FEF2F2")
                risk_color = colors.HexColor("#991B1B")
                risk_text = "Dangerous"
            elif port_num < 1024:
                risk_bg = colors.HexColor("#FFFBEB")
                risk_color = colors.HexColor("#92400E")
                risk_text = "Medium"
            else:
                risk_bg = colors.HexColor("#F0FDF4")
                risk_color = colors.HexColor("#166534")
                risk_text = "Safe"
                
            risk_pstyle = ParagraphStyle(name=f"Risk_{idx}", parent=table_cell_bold_style, textColor=risk_color, alignment=1)
            t1_styles.append(("BACKGROUND", (3, idx), (3, idx), risk_bg))
            
            # CVEs Found
            port_cves = [c for c in cves if c.get('port') == port_num_str] # get_scan_cves doesn't attach port, but let's count matching service
            service_name = p.get("service", "unknown").lower()
            version_str = p.get("version", "unknown").lower()
            
            # In reports/service.py, CVEs are detected by service/version. 
            # We'll re-run a quick check for this port to get accurate count.
            cve_count = 0
            if "squid" in service_name or "squid" in version_str:
                if "5." in version_str: cve_count += 1
            if "apache" in service_name or "apache" in version_str:
                if "2.4" in version_str: cve_count += 1
            if "ssh" in service_name or "ssh" in version_str:
                if "9.8" not in version_str: cve_count += 1

            if cve_count > 0:
                cve_pstyle = ParagraphStyle(name=f"Cve_{idx}", parent=table_cell_bold_style, textColor=colors.HexColor("#EF4444"), alignment=1)
                cve_text = str(cve_count)
            else:
                cve_pstyle = ParagraphStyle(name=f"Cve_{idx}", parent=table_cell_bold_style, textColor=colors.HexColor("#22C55E"), alignment=1)
                cve_text = "None"

            table1_data.append([
                Paragraph(f"{port_num_str}/{p.get('protocol', 'tcp')}", table_cell_bold_style),
                Paragraph(p.get("service", "unknown"), table_cell_style),
                Paragraph(p.get("version", "Unknown"), table_cell_style),
                Paragraph(risk_text, risk_pstyle),
                Paragraph(cve_text, cve_pstyle)
            ])
            
            banner_val = p.get("banner", "")
            if not banner_val or banner_val == "N/A":
                banner_para = Paragraph("No banner captured", italic_gray)
            else:
                banner_clean = str(banner_val).replace('\r\n', ' | ').replace('\n', ' | ')
                if len(banner_clean) > 90:
                    banner_clean = banner_clean[:90] + "..."
                banner_para = Paragraph(banner_clean, mono_style)
                
            table2_data.append([
                Paragraph(f"{port_num_str}/{p.get('protocol', 'tcp')}<br/><font color='#64748b'>{p.get('service', 'unknown')}</font>", table_cell_bold_style),
                banner_para
            ])

        t1 = Table(table1_data, colWidths=[60, 80, 140, 80, 80])
        t1.setStyle(TableStyle(t1_styles))
        story.append(t1)
        story.append(Spacer(1, 20))
        
        story.append(create_section_header("Banner & Handshake Information"))
        story.append(Spacer(1, 10))
        
        t2 = Table(table2_data, colWidths=[100, 432])
        t2.setStyle(TableStyle(t2_styles))
        story.append(t2)
        
    else:
        story.append(create_section_header("Open Ports Summary"))
        story.append(Spacer(1, 10))
        story.append(Paragraph("<i>No open ports or service details were detected on the target.</i>", body_style))
    
    story.append(Spacer(1, 20))

    # Section 5: MITRE ATT&CK ANALYSIS
    story.append(Paragraph("MITRE ATT&CK Analysis", section_style))
    try:
        from intel.mitre import get_techniques
        techniques = get_techniques(ports)
    except ImportError:
        techniques = []

    if not ports:
        story.append(Paragraph("<i>No open ports detected — no attack techniques applicable</i>", body_style))
    elif not techniques:
        story.append(Paragraph("<i>Detected services have no direct ATT&CK mappings</i>", body_style))
    else:
        for t in techniques:
            tech_header = Table([[
                Paragraph(f"<b>{t['id']} — {t['name']}</b>", table_header_style),
                Paragraph(f"<b>Tactic: {t['tactic']}</b>", table_header_style)
            ]], colWidths=[382, 150])
            tech_header.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#1E293B")),
                ("PADDING", (0, 0), (-1, -1), 4),
            ]))
            story.append(tech_header)
            
            tech_details = [
                [Paragraph("<b>Description:</b>", table_cell_bold_style), Paragraph(t.get("description", ""), table_cell_style)],
                [Paragraph("<b>Recommendation:</b>", table_cell_bold_style), Paragraph(t.get("recommendation", ""), table_cell_style)],
            ]
            tech_table = Table(tech_details, colWidths=[120, 412])
            tech_table.setStyle(TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#E2E8F0")),
                ("PADDING", (0, 0), (-1, -1), 4),
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ]))
            story.append(tech_table)
            story.append(Spacer(1, 8))

    # Section 6: Actionable Recommendations
    story.append(Paragraph("Actionable Security Recommendations", section_style))
    
    RECOMMENDATIONS = [
        (23,    "HIGH",   "Disable Telnet (Port 23)", "Replace with SSH immediately. Telnet transmits all data including credentials in plaintext."),
        (21,    "HIGH",   "Replace FTP (Port 21) with SFTP or FTPS", "FTP credentials are transmitted in cleartext and trivially intercepted on the network."),
        (3389,  "HIGH",   "Restrict RDP (Port 3389) to VPN-only access", "Exposed RDP is a primary ransomware and brute-force entry point."),
        (445,   "HIGH",   "Firewall SMB (Port 445) from external access", "Disable if file sharing is not required — EternalBlue exploits this port."),
        (6379,  "HIGH",   "Secure Redis (Port 6379)", "Bind to localhost and set requirepass in redis.conf. Unauthenticated Redis exposes all data."),
        (80,    "MEDIUM", "Redirect HTTP (Port 80) to HTTPS", "Use a permanent 301 redirect and add HSTS header to prevent downgrade attacks."),
        (5432,  "MEDIUM", "Restrict PostgreSQL (Port 5432) to localhost", "Database ports should never be publicly accessible from the internet."),
        (3306,  "MEDIUM", "Restrict MySQL (Port 3306) to localhost", "Whitelist only the application server IP. Never expose databases publicly."),
        (443,   "LOW",    "Verify TLS configuration on Port 443", "Ensure certificate is valid, TLS 1.0/1.1 disabled, strong cipher suites enforced."),
        (22,    "LOW",    "Harden SSH (Port 22)", "Disable password auth, use key-based auth only. Consider changing default port."),
    ]
    ALWAYS_LOW = ("LOW", "Close unused ports", "Ports not required for business operations should be closed. Run quarterly port audits.")

    port_nums_for_recs = []
    for p in ports:
        try:
            p_str = p.get('port', '0')
            if isinstance(p_str, str) and "/" in p_str:
                p_num = int(p_str.split("/")[0])
            else:
                p_num = int(p_str)
            port_nums_for_recs.append(p_num)
        except:
            pass

    active_recs = [(sev, title, desc) for (port, sev, title, desc) in RECOMMENDATIONS if port in port_nums_for_recs]
    active_recs.append(ALWAYS_LOW)
    order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    active_recs.sort(key=lambda x: order[x[0]])

    for sev, title, desc in active_recs:
        if sev == "HIGH":
            badge_bg = colors.HexColor("#ef4444")
            badge_tc = colors.white
        elif sev == "MEDIUM":
            badge_bg = colors.HexColor("#eab308")
            badge_tc = colors.black
        else:
            badge_bg = colors.HexColor("#3b82f6")
            badge_tc = colors.white
            
        badge_style = ParagraphStyle(name="RecBadge", fontName="Helvetica-Bold", fontSize=8, textColor=badge_tc, alignment=1)
        title_style = ParagraphStyle(name="RecTitle", fontName="Helvetica-Bold", fontSize=11, textColor=colors.HexColor("#1e293b"))
        desc_style = ParagraphStyle(name="RecDesc", fontName="Helvetica", fontSize=10, textColor=colors.HexColor("#475569"))
        
        rec_table = Table(
            [
                [Paragraph(sev, badge_style), Paragraph(title, title_style)],
                ["", Paragraph(desc, desc_style)]
            ],
            colWidths=[50, 482],
            rowHeights=[14, None]
        )
        rec_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, 0), badge_bg),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("VALIGN", (1, 1), (1, 1), "TOP"),
            ("LEFTPADDING", (0, 0), (0, 0), 0),
            ("RIGHTPADDING", (0, 0), (0, 0), 0),
            ("LEFTPADDING", (1, 0), (1, -1), 10),
        ]))
        
        story.append(rec_table)
        story.append(Spacer(1, 6))
        
        line = Table([[""]], colWidths=[532], rowHeights=[1])
        line.setStyle(TableStyle([("LINEBELOW", (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0"))]))
        story.append(line)
        story.append(Spacer(1, 6))

    story.append(Spacer(1, 10))

    # Section 7: Footer Notes
    story.append(create_section_header("Audit Notes"))
    story.append(Spacer(1, 10))
    scan_date_txt = format_datetime_sig(scan.start_time)
    audit_text = f"This report was generated by NetReconX on {scan_date_txt}. All findings are based on live TCP connect scan results against {scan.target}. This document is intended strictly for authorized security assessment and network administration purposes only. Unauthorized use of this report or its contents is prohibited."
    story.append(Paragraph(audit_text, body_style))

    from reportlab.pdfgen import canvas
    def get_numbered_canvas(target_str: str, scan_date_str: str):
        class NumberedCanvas(canvas.Canvas):
            def __init__(self, *args, **kwargs):
                canvas.Canvas.__init__(self, *args, **kwargs)
                self._saved_page_states = []

            def showPage(self):
                self._saved_page_states.append(dict(self.__dict__))
                self._startPage()

            def save(self):
                num_pages = len(self._saved_page_states)
                for state in self._saved_page_states:
                    self.__dict__.update(state)
                    if True:  # Header and footer on all pages
                        page_width, page_height = self._pagesize
                        
                        # Header
                        self.setStrokeColor(colors.HexColor("#e2e8f0"))
                        self.setLineWidth(0.5)
                        self.line(40, page_height - 30, page_width - 40, page_height - 30)
                        
                        self.setFont("Helvetica-Bold", 8)
                        self.setFillColor(colors.HexColor("#0f172a"))
                        self.drawString(40, page_height - 25, "NetReconX Security Assessment Report")
                        
                        self.setFont("Helvetica", 8)
                        self.setFillColor(colors.HexColor("#475569"))
                        self.drawRightString(page_width - 40, page_height - 25, f"{target_str} | {scan_date_str}")
                        
                        # Footer
                        self.setStrokeColor(colors.HexColor("#e2e8f0"))
                        self.setLineWidth(0.5)
                        self.line(40, 45, page_width - 40, 45)
                        
                        self.setFont("Helvetica", 8)
                        self.setFillColor(colors.HexColor("#94a3b8"))
                        self.drawString(40, 30, "CONFIDENTIAL — Authorized Use Only")
                        
                        content_page_num = self._pageNumber
                        content_total = max(1, num_pages)
                        self.drawRightString(page_width - 40, 30, f"Page {content_page_num} of {content_total}")
                        
                    canvas.Canvas.showPage(self)
                canvas.Canvas.save(self)
        return NumberedCanvas

    doc.build(story, canvasmaker=get_numbered_canvas(scan.target, format_datetime_sig(scan.start_time)))
