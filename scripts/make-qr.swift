import AppKit
import CoreImage
import Foundation

let payload = CommandLine.arguments[1]
let outPath = CommandLine.arguments[2]
let targetPx = 720

guard let filter = CIFilter(name: "CIQRCodeGenerator") else {
    fatalError("ไม่มี CIQRCodeGenerator")
}
filter.setValue(payload.data(using: .utf8), forKey: "inputMessage")
filter.setValue("M", forKey: "inputCorrectionLevel")

guard let generated = filter.outputImage else { fatalError("สร้าง QR ไม่ได้") }
let ciContext = CIContext()
guard let small = ciContext.createCGImage(generated, from: generated.extent) else {
    fatalError("แปลงเป็น CGImage ไม่ได้")
}

let modules = small.width
let scale = max(1, targetPx / modules)
let quietModules = 4
let side = (modules + quietModules * 2) * scale

guard
    let ctx = CGContext(
        data: nil, width: side, height: side, bitsPerComponent: 8, bytesPerRow: 0,
        space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue)
else { fatalError("สร้าง context ไม่ได้") }

ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
ctx.fill(CGRect(x: 0, y: 0, width: side, height: side))
ctx.interpolationQuality = .none
let inset = CGFloat(quietModules * scale)
ctx.draw(
    small,
    in: CGRect(
        x: inset, y: inset, width: CGFloat(modules * scale), height: CGFloat(modules * scale)))

guard let final = ctx.makeImage() else { fatalError("render ไม่ได้") }
guard let png = NSBitmapImageRep(cgImage: final).representation(using: .png, properties: [:])
else { fatalError("เข้ารหัส PNG ไม่ได้") }
try png.write(to: URL(fileURLWithPath: outPath))

let detector = CIDetector(
    ofType: CIDetectorTypeQRCode, context: nil,
    options: [CIDetectorAccuracy: CIDetectorAccuracyHigh])!
let decoded = detector.features(in: CIImage(cgImage: final))
    .compactMap { ($0 as? CIQRCodeFeature)?.messageString }

print("เขียนแล้ว: \(outPath)  \(side)x\(side)px  (\(modules) modules x\(scale))")
print("ถอดรหัสกลับได้: \(decoded)")
if decoded == [payload] {
    print("✓ ตรงกับที่ใส่ไปเป๊ะ — สแกนติดแน่")
} else {
    print("✗ ถอดกลับไม่ตรง")
    exit(1)
}
