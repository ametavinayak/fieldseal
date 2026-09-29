from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from pathlib import Path
W,H=960,540
out=Path(__file__).resolve().parents[1]/"output/pdf/Drug Testing - Corrected.pdf"
c=canvas.Canvas(str(out),pagesize=(W,H))
c.setTitle("Digital Companion for Field Drug Testing | BarelyLegal | Corrected prototype scope")
navy=HexColor("#112942"); teal=HexColor("#087F88"); muted=HexColor("#526479")

def text(value,x,y,width=820,size=16,color=navy,bold=False):
    p=Paragraph(value,ParagraphStyle("p",fontName="Helvetica-Bold" if bold else "Helvetica",fontSize=size,leading=size*1.4,textColor=color))
    _,h=p.wrap(width,400);p.drawOn(c,x,y-h);return y-h

def page(title,n,subtitle=""):
    c.setFillColor(HexColor("#F5F8FB"));c.rect(0,0,W,H,fill=1,stroke=0)
    c.setFillColor(navy);c.rect(0,H-13,W,13,fill=1,stroke=0)
    text(title,44,490,size=29,bold=True)
    if subtitle:text(subtitle,44,438,size=14,color=muted)
    c.setStrokeColor(HexColor("#D8E2EB"));c.line(44,44,916,44)
    text("BARELYLEGAL  /  SIH 2026  /  PS 26231",44,32,size=10,color=muted)
    text(f"{n:02d} / 07",863,32,width=65,size=10,color=muted)

def block(title,body,x,y,w=405):
    y=text(title,x,y,width=w,size=19,bold=True)
    return text(body,x,y-12,width=w,size=15,color=muted)

page("Digital Companion for Field Drug Testing",1,"Smart India Hackathon 2026 | Software | MedTech / BioTech / HealthTech")
text("A clearer field record.<br/>A traceable path to laboratory confirmation.",44,366,size=35,width=820,bold=True)
text("FieldSeal - submission prototype",44,240,size=22,color=teal,bold=True)
text("Team BarelyLegal | Team ID 156945<br/>Problem statement organisation: Ministry of Home Affairs (NCB)",44,184,size=17)
text("Prototype scope and intended capabilities are separated throughout. No agency endorsement or validated identification performance is claimed.",44,105,size=12,color=muted)
c.showPage()

page("The problem and our response",2,"Support the existing field workflow without changing the kit or overstating the result.")
block("Record the observation","Field colour readings can be affected by illumination, camera processing, kit condition and interpretation. Capture the image, kit lot, operator and case reference together.",44,380)
block("Abstain when evidence is weak","An unsuitable capture or unvalidated input remains Inconclusive, with a reason and a retake path. A phone image alone does not establish substance identity.",511,380)
block("Preserve a reviewable trail","Link capture, evidence bag, transfers and laboratory follow-up under one record ID. Use hashes and signatures to make changes detectable within a stated trust model.",44,224)
block("Keep confirmation independent","Presumptive field results require appropriate laboratory confirmation. GC-MS is one possible analytical method, not the only universally required method.",511,224)
c.showPage()

page("A complete prototype journey",3,"Demonstration scenarios are labelled. Uploaded photographs are recorded without invented classifications.")
rows=[("1  Register","Enter case, bag and operator details; select a kit and block expired lots."),("2  Capture","Upload a photo or select a synthetic sample; show reference, lighting and alignment checks."),("3  Review","Show a demonstration indication, no indication or Inconclusive result with a reason."),("4  Seal","Persist an immutable record payload; calculate SHA-256 and sign with a demo server key."),("5  Verify","Export a signed bundle; detect modified payloads or custody entries during verification."),("6  Follow up","Record custody transfers and link a manually entered laboratory outcome.")]
y=383
for label,body in rows:
    text(label,44,y,width=160,size=17,bold=True);text(body,215,y,width=690,size=15,color=muted)
    y-=49
c.showPage()

page("Architecture with a clear trust boundary",4,"Prototype implementation target - independently testable frontend, API and record integrity.")
block("Web interface","React + TypeScript<br/>Responsive capture, records, verifier and kit views.<br/>Local drafts and a visible offline queue; synchronization when connected.",44,380)
block("API and persistence","FastAPI + validated request models<br/>SQLite for a reproducible local demo.<br/>PostgreSQL migration path for a future multi-user deployment.",511,380)
block("Integrity foundation","SHA-256 content digests<br/>ECDSA P-256 demo server signatures<br/>Chained custody events and idempotent record creation.<br/>Private keys stay out of Git.",44,218)
block("Production work remains","Authentication and permissions, encrypted storage and key management, native hardware attestation, trusted timestamps, privacy review and agency integration.",511,218)
c.showPage()

page("Honest claims make a stronger submission",5,"Corrections applied to the original deck.")
items=[("Tamper-proof / court-ready","Tamper-evident under a defined key and record-storage trust model. Admissibility is not guaranteed by software."),("Any phone becomes the same instrument","Calibration is an engineering goal. Validate device, lighting, reagent and card variation before claiming equivalence."),("Validated on 5,000 images / 80% savings","Remove as achieved claims. No supporting dataset or measured timing study was supplied."),("100% offline and hardware-backed signing","Separate intended native production features from browser draft storage and demo server signing."),("Public QR exposes each case","Use privacy-preserving verification in production; avoid disclosing case details through public links.")]
y=380
for title,body in items:
    text(title,44,y,width=315,size=16,bold=True);text(body,380,y,width=532,size=14,color=muted);y-=61
c.showPage()

page("Validation before operational use",6,"The prototype demonstrates workflow and integrity. Predictive performance must be measured separately.")
block("Build a labelled dataset","Obtain lawful, authorized kit-specific reference captures with independent laboratory outcomes. Record device, lighting, kit lot, expiry and reference-card details.",44,380)
block("Measure the failure cases","Test false indications, missed indications, ambiguous readings and abstentions. Include interference, poor illumination, missing references and unsupported devices.",511,380)
block("Keep evaluation independent","Separate training, validation and final test data by sample/session and kit/device where appropriate. Report per-class metrics and uncertainty; avoid demo-only accuracy claims.",44,213)
block("Test records as well as models","Check altered payloads, deleted/reordered events, duplicate sync requests, expired kits and missing captures. Review access, retention and incident handling before a pilot.",511,213)
c.showPage()

page("Evidence, references and next milestones",7,"Source material corrected for relevance and claim strength.")
text("References",44,384,size=20,bold=True)
text("SWGDRUG - Approved Recommendations, Edition 8.2 (27 June 2024). Colour testing has limited discriminating power; identification uses an appropriate analytical scheme.",44,346,width=866,size=15)
text("swgdrug.org/approved.htm",44,291,size=13,color=teal)
c.linkURL("https://www.swgdrug.org/approved.htm",(44,268,470,291),relative=0)
text("Bharatiya Sakshya Adhiniyam, 2023 - Section 63 and applicable certificate requirements. A generated bundle is not a completed statutory certificate; implementation requires qualified legal review.",44,252,width=866,size=15)
text("indiacode.nic.in - official legislation",44,193,size=13,color=teal)
c.linkURL("https://www.indiacode.nic.in/",(44,170,520,193),relative=0)
text("Next: finish and test the prototype; publish reviewed code and demo links; establish an authorized dataset and validation protocol before deploying a classifier.",44,144,width=850,size=17,bold=True)
text("Unrelated satellite/LoRA references, unsubstantiated market figures and the duplicate draft page have been removed. Submission links remain pending until verified.",44,80,width=870,size=11,color=muted)
c.save()
print(out)
