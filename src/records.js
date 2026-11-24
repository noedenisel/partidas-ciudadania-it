export const fields = {
  given: "Nombre y apellido",
  sex: "Sexo según partida",
  born: "Fecha de nacimiento",
  origin: "Lugar de nacimiento",
  father: "Nombre y apellido del padre",
  mother: "Nombre y apellido de la madre",
  age: "Edad al casarse",
  nationality: "Nacionalidad",
  spouse: "Nombre y apellido del cónyuge",
  marriagePlace: "Lugar de matrimonio",
  married: "Fecha de matrimonio",
  died: "Fecha de defunción",
  place: "Lugar de defunción",
  dni: "Documento",
};
const identity = ["given"],
  parents = ["father", "mother"];
export const types = {
  Nacimiento: [...identity, "sex", "born", "origin", ...parents],
  Matrimonio: [
    ...identity,
    "age",
    "nationality",
    "origin",
    ...parents,
    "spouse",
    "marriagePlace",
    "married",
  ],
  Defunción: [
    ...identity,
    "dni",
    "nationality",
    "origin",
    "born",
    ...parents,
    "died",
    "place",
  ],
};
const normalized = (s) => s.trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
function citation(type, owner) {
  return "En la partida de " + type.toLowerCase() + " de " + owner;
}

export function discrepancies(people) {
  const findings = [];
  for (const person of people) {
    for (const [key, label] of Object.entries(fields)) {
      const entries = Object.entries(person.records).filter(([, record]) =>
        record[key]?.trim(),
      );
      if (
        new Set(entries.map(([, record]) => normalized(record[key]))).size > 1
      ) {
        findings.push({
          person: person.name,
          label,
          lines: entries.map(([type, record]) =>
            citation(type, person.name) + " figura «" + record[key] + "»."
          ),
        });
      }
    }
    const birth = person.records.Nacimiento,
      marriage = person.records.Matrimonio;
    if (birth?.born && marriage?.married && marriage.age?.trim()) {
      const years =
        Number(marriage.married.slice(0, 4)) -
        Number(birth.born.slice(0, 4)) -
        Number(marriage.married.slice(5) < birth.born.slice(5));
      if (years !== Number(marriage.age))
        findings.push({
          person: person.name,
          label: "Edad al casarse",
          lines: [
            citation("Matrimonio", person.name) + " figuran " + marriage.age + " años al casarse el " + marriage.married + ".",
            citation("Nacimiento", person.name) + " figura la fecha " + birth.born + ". A la fecha del matrimonio tenía " + years + " años.",
          ],
        });
    }
    const parent = people.find((p) => p.id === person.parentId);
    if (!parent) continue;
    const key = person.side === "mother" ? "mother" : "father";
    const adult = parent.records.Nacimiento?.given;
    for (const [type, record] of Object.entries(person.records)) {
      const child = record[key];
      if (
        child?.trim() &&
        adult?.trim() &&
        normalized(child) !== normalized(adult)
      ) {
        findings.push({
          person: parent.name,
          label: "Nombre y apellido",
          lines: [
            citation(type, person.name) + " figura como " + (key === "mother" ? "madre" : "padre") + " «" + child + "».",
            citation("Nacimiento", parent.name) + " figura «" + adult + "».",
          ],
        });
      }
    }
  }
  return findings;
}
export function importLegacy(raw) {
  const rows = JSON.parse(raw);
  if (!Array.isArray(rows) || !rows.length)
    throw Error("No hay partidas anteriores para importar.");
  const people = rows.map((row) => {
    const data = Object.values(row).find((v) => v?.partidaNacimiento);
    if (!data?.partidaNacimiento?.persona)
      throw Error("El archivo de partidas anteriores está incompleto.");
    const b = data.partidaNacimiento,
      m = data.partidaMatrimonio,
      d = data.partidaDefuncion;
    const records = {
      Nacimiento: {
        given: b.persona,
        sex: b.sexo,
        born: b.bday,
        origin: b.lugarNacimiento,
        father: b.padre,
        mother: b.madre,
      },
    };
    if (m)
      records.Matrimonio = {
        given: m.persona,
        age: m.age,
        nationality: m.nacionalidad,
        origin: m.bdayPlace,
        father: m.hijoDe?.padre,
        mother: m.hijoDe?.madre,
        spouse: m.conyuge,
        married: m.date,
        marriagePlace: m.place,
      };
    if (d)
      records.Defunción = {
        given: d.person || d.persona,
        dni: d.dni,
        born: d.bdayDate,
        nationality: d.nacionalidad,
        origin: d.bdayPlace,
        father: d.hijoDe?.padre,
        mother: d.hijoDe?.madre,
        died: d.deathDate,
        place: d.deathPlace,
      };
    for (const values of Object.values(records))
      for (const k of Object.keys(values)) values[k] = String(values[k] ?? "");
    return { id: crypto.randomUUID(), name: b.persona, records };
  });
  for (const child of people) {
    const birth = child.records.Nacimiento;
    for (const side of ["mother", "father"]) {
      const matches = people.filter(
        (p) => p !== child && normalized(p.name) === normalized(birth[side]),
      );
      if (matches.length === 1) {
        child.parentId = matches[0].id;
        child.side = side;
        break;
      }
    }
  }
  return people;
}
