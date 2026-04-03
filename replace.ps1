
$content = Get-Content -Raw -Path src/app/api/resumes/parse/route.ts
$content = $content -replace "(?s)// Using require since pdf-parse lacks an ES module default export.*?const rawText = pdfData\.text;", @"
import PDFParser from "pdf2json";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from the PDF using pdf2json
    const rawText = await new Promise<string>((resolve, reject) => {
      const pdfParser = new PDFParser(this, 1);
      pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
      pdfParser.on("pdfParser_dataReady", () => {
        resolve(pdfParser.getRawTextContent());
      });
      pdfParser.parseBuffer(buffer);
    });
"@
Set-Content -Path src/app/api/resumes/parse/route.ts -Value $content

