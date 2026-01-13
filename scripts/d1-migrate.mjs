import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dbDir = path.join(process.cwd(), 'static', 'data', 'database');
const amendmentsPath = path.join(dbDir, 'amendments.sqlite');
const personsPath = path.join(dbDir, 'persons.sqlite');
const outputPath = path.join(process.cwd(), 'd1-import.sql');

function esc(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function writeLine(buffer, line) {
  buffer.push(line + '\n');
}

function generateAmendmentsSQL(db, buffer) {
  writeLine(buffer, 'CREATE TABLE IF NOT EXISTS amendments (');
  writeLine(buffer, '  amendment_id TEXT PRIMARY KEY,');
  writeLine(buffer, '  convention_id TEXT,');
  writeLine(buffer, '  amendment_url_html TEXT,');
  writeLine(buffer, '  amendment_title_with_prefix TEXT,');
  writeLine(buffer, '  amendment_initiators TEXT,');
  writeLine(buffer, '  amendment_supporters TEXT');
  writeLine(buffer, ');');
  const rows = db
    .prepare(
      'SELECT amendment_id, convention_id, amendment_url_html, amendment_title_with_prefix, amendment_initiators, amendment_supporters FROM amendments'
    )
    .all();
  for (const r of rows) {
    writeLine(
      buffer,
      `INSERT INTO amendments (amendment_id, convention_id, amendment_url_html, amendment_title_with_prefix, amendment_initiators, amendment_supporters) VALUES (${esc(
        r.amendment_id
      )}, ${esc(r.convention_id)}, ${esc(r.amendment_url_html)}, ${esc(
        r.amendment_title_with_prefix
      )}, ${esc(r.amendment_initiators)}, ${esc(r.amendment_supporters)});`
    );
  }
}

function generatePersonsSQL(db, buffer) {
  writeLine(buffer, 'CREATE TABLE IF NOT EXISTS persons (');
  writeLine(buffer, '  person_id TEXT PRIMARY KEY,');
  writeLine(buffer, '  person_name TEXT,');
  writeLine(buffer, '  person_organization TEXT,');
  writeLine(buffer, '  initiated_amendments TEXT,');
  writeLine(buffer, '  person_initiated_amount INTEGER,');
  writeLine(buffer, '  supported_amendments TEXT,');
  writeLine(buffer, '  person_supported_amount INTEGER');
  writeLine(buffer, ');');
  const rows = db
    .prepare(
      'SELECT person_id, person_name, person_organization, initiated_amendments, person_initiated_amount, supported_amendments, person_supported_amount FROM persons'
    )
    .all();
  for (const r of rows) {
    writeLine(
      buffer,
      `INSERT INTO persons (person_id, person_name, person_organization, initiated_amendments, person_initiated_amount, supported_amendments, person_supported_amount) VALUES (${esc(
        r.person_id
      )}, ${esc(r.person_name)}, ${esc(r.person_organization)}, ${esc(
        r.initiated_amendments
      )}, ${r.person_initiated_amount ?? 0}, ${esc(
        r.supported_amendments
      )}, ${r.person_supported_amount ?? 0});`
    );
  }
}

function main() {
  const buffer = [];
  const amendDb = new Database(amendmentsPath, { readonly: true });
  const personsDb = new Database(personsPath, { readonly: true });
  try {
    generateAmendmentsSQL(amendDb, buffer);
    writeLine(buffer, '');
    generatePersonsSQL(personsDb, buffer);
  } finally {
    amendDb.close();
    personsDb.close();
  }
  fs.writeFileSync(outputPath, buffer.join(''), 'utf-8');
  console.log(`Wrote SQL import file: ${outputPath}`);
}

main();

