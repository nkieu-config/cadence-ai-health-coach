async function main() {
  throw new Error(
    "INFRA-06: seed script ยังไม่ implement — ดู .scratch/infra/issues/06-seed-script.md"
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
