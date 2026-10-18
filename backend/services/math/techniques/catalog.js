const TECHNIQUES = [
  { id: "ekadhikena-purvena", name: "Ekadhikena Purvena", sutra: "Ekadhikena Purvena", difficulty: "Beginner", category: "Squaring", supportedOperations: ["square-ending-in-five"] },
  { id: "nikhilam-subtraction", name: "Nikhilam Navatashcaramam Dashatah", sutra: "Nikhilam Navatashcaramam Dashatah", difficulty: "Beginner", category: "Multiplication", supportedOperations: ["near-base-multiplication"] },
  { id: "sankalana-vyavakalanabhyam", name: "Sankalana–Vyavakalanabhyam", sutra: "Sankalana-Vyavakalanabhyam", difficulty: "Beginner", category: "Equations", supportedOperations: ["symmetric-linear-system"] },
  { id: "yavadunam", name: "Yavadunam", sutra: "Yavadunam", difficulty: "Beginner", category: "Squaring", supportedOperations: ["near-base-square"] },
  { id: "ekanyunena-purvena", name: "Ekanyunena Purvena", sutra: "Ekanyunena Purvena", difficulty: "Beginner", category: "Multiplication", supportedOperations: ["multiply-by-nines"] },
  { id: "vyastisamastih", name: "Vyastisamastih", sutra: "Vyastisamastih", difficulty: "Beginner", category: "Equations", supportedOperations: ["factor-quadratic"] },
  { id: "vertically-crosswise", name: "Urdhva-Tiryagbhyam", sutra: "Urdhva Tiryak", difficulty: "Intermediate", category: "Multiplication", supportedOperations: ["integer-multiplication"] },
  { id: "anurupyena", name: "Anurupyena", sutra: "Anurupyena", difficulty: "Intermediate", category: "Multiplication", supportedOperations: ["sub-base-multiplication"] },
  { id: "puranapuranabhyam", name: "Puranapuranabhyam", sutra: "Puranapuranabhyam", difficulty: "Intermediate", category: "Equations", supportedOperations: ["complete-square"] },
  { id: "sesanyankena-caramena", name: "Sesanyankena Caramena", sutra: "Sesanyankena Caramena", difficulty: "Intermediate", category: "Division", supportedOperations: ["fraction-leading-digit"] },
  { id: "sopantyadvayamantyam", name: "Sopantyadvayamantyam", sutra: "Sopantyadvayamantyam", difficulty: "Intermediate", category: "Equations", supportedOperations: ["symmetric-rational-equation"] },
  { id: "paravartya-yojayet", name: "Paravartya Yojayet", sutra: "Paravartya Yojayet", difficulty: "Advanced", category: "Division", supportedOperations: ["integer-division-remainder"] },
  { id: "sunyam-samyasamuccaye", name: "Sunyam Samyasamuccaye", sutra: "Sunyam Samyasamuccaye", difficulty: "Advanced", category: "Equations", supportedOperations: ["linear-equation"] },
  { id: "chalana-kalanabhyam", name: "Chalana-Kalanabhyam", sutra: "Chalana-Kalanabhyam", difficulty: "Advanced", category: "Calculus", supportedOperations: ["quadratic-derivative"] },
  { id: "gunitasamuccayah", name: "Gunitasamuccayah", sutra: "Gunitasamuccayah", difficulty: "Advanced", category: "Algebra", supportedOperations: ["coefficient-sum-product"] },
  { id: "gunakasamuccayah", name: "Gunakasamuccayah", sutra: "Gunakasamuccayah", difficulty: "Advanced", category: "Algebra", supportedOperations: ["factor-coefficient-sums"] }
];

const catalogById = new Map(TECHNIQUES.map((technique) => [technique.id, technique]));

const getTechnique = (techniqueId) => catalogById.get(techniqueId) || null;

const listTechniques = () => TECHNIQUES.map((technique) => ({
  ...technique,
  supportedOperations: [...technique.supportedOperations]
}));

module.exports = { TECHNIQUES, catalogById, getTechnique, listTechniques };
