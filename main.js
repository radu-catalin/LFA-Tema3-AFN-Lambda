// Notez L := lambda

const fs = require('fs');
const { ReadStream, WriteStream, fillArray } = require('./utility');

const fin = './afn.in'; // fisierul de intrare;
const fout = './afn.out'; // fisierul de iesire
const lambda = 'L';

class AfnLambda {
  n; // numarul de stari
  ch; // vectorul caracteristic al starilor
  alphabet; // alfabetul folosit
  states; // vector de stari
  k; // numarul de arce din graf
  v; // matricea de adiacenta
  m; // numarul de cuvinte date
  words; // cuvintele date

  constructor(fin, fout) {
    const f = new ReadStream(fin); // deschid fisierul
    this.fout = new WriteStream(fout);

    // citesc datele si le prelucrez
    this.n = parseInt(f.getLine());
    this.ch = f
      .getLine()
      .split(' ')
      .map((el) => parseInt(el));
    this.alphabet = f.getLine();
    this.states = f
      .getLine()
      .split(' ')
      .map((el) => parseInt(el));
    this.k = parseInt(f.getLine());
    this.v = this.readMatrix(f);
    this.m = f.getLine();
    this.words = this.readWords(f);
  }

  solve() {
    // parcurgem fiecare cuvant
    this.words.forEach((word) => {
      // starea curenta
      let currentState = [0];

      // parcurgem fiecare litera din cuvant
      [...word].forEach((letter) => {
        // urmatoarea stare
        let nextState = [];

        // parcurgem starea curenta
        for (const state of currentState) {
          // calculam lambda inchiderea lui state
          const closure = this.closure(state);

          // parcurgeam lambda inchiderea lui state
          for (const col of closure) {
            // vedem daca exista o muchie care pleaca din starea col
            for (let q = 0; q < this.n; q++) {
              if (this.v[col][q].includes(letter) && letter !== lambda) {
                nextState.push(q); // adaugam starea gasita in array
              }
            }
          }
        }

        // eliminam duplicarile din array si nextState devine currentState
        currentState = nextState.filter((item, index) => nextState.indexOf(item) === index);
      });

      // daca in currentState exista o stare finala, atunci cuvantul este valid, altfel cuvantul nu este valid
      let isValid = false;
      for (const state of currentState) {
        if (this.ch[state]) {
          isValid = true;
          break;
        }
      }

      if (isValid) {
        this.fout.appendFile(word + ' ' + isValid);
      } else {
        this.fout.appendFile(word + ' ' + isValid);
      }
    });
  }

  // DFS care iti returneaza un array cu toate lambda inchiderile unei stari
  closure(start) {
    let arr = [start];
    for (let q = 0; q < this.n; q++) {
      if (this.v[start][q].includes(lambda)) {
        arr = arr.concat(this.closure(q) || q);
      }
    }
    return arr;
  }

  readMatrix(f) {
    let v = fillArray('', this.n, this.n);
    // introducem datele in matricea v
    for (let i = 0; i < this.k; i++) {
      let data = f
        .getLine()
        .split(' ')
        .filter((num) => num !== ' ');
      data[1] = parseInt(data[1]);
      data[2] = parseInt(data[2]);
      if (this.alphabet.includes(data[0]) || data[0] === lambda) {
        v[data[1]][data[2]] += data[0];
      } else {
        console.log('Lista de adiacenta data nu este valida!');
        console.log('ERROR: -->', data[0], data[1], data[2], '. Muchia aceasta contine litere care nu sunt din vocabular');
        fs.writeFileSync(fout, '');
        process.exit();
      }
    }

    return v;
  }

  readWords(f) {
    let words = [];
    // citim m cuvinte
    for (let i = 0; i < this.m; i++) {
      words.push(f.getLine());
    }
    return words;
  }
}

const afn = new AfnLambda(fin, fout);
afn.solve();
