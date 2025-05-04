# Dispensa di Studio Introduttiva ad Arduino

Questa dispensa si basa sui contenuti della playlist di tutorial introduttivi ad Arduino fornita, con l'obiettivo di presentare in maniera chiara e dettagliata i concetti fondamentali e le applicazioni pratiche di questa piattaforma.

---

## Sezione 1: Introduzione ad Arduino e Panoramica Generale

Arduino è una scheda elettronica nata in Italia ed è un progetto completamente **Open Source**, sia per la parte hardware che software.

L'ambiente di sviluppo **Arduino IDE** serve per scrivere i programmi (chiamati _sketch_) che vengono poi trasferiti sulla scheda per l'esecuzione. Essendo un progetto **Open Source**, è possibile consultare sia il codice sorgente del software che gli schemi circuitali della scheda.

Arduino è stato pensato per scopi didattici e per realizzare facilmente **prototipi funzionanti**. Tuttavia, il suo utilizzo si estende anche a settori come la robotica e la domotica.

### Tipologie di schede Arduino

Le schede più utilizzate sono:

- **Arduino Uno** (la più comune)
    
- **Arduino Mega** (con più porte I/O e memoria)
    
- **Arduino Leonardo** (con USB nativa)
    
- **Arduino LilyPad** (adatta a indumenti smart)
    

---

## Sezione 2: Componenti Hardware e Loro Funzionalità

### **Componenti della scheda Arduino Uno**

- **Microcontrollore ATmega**: il cuore della scheda.
    
- **Porta USB**: per la programmazione e l'alimentazione.
    
- **Jack di alimentazione**: per alimentare la scheda da fonte esterna (6-20V, consigliato 7-12V).
    
- **Pin di alimentazione**:
    
    - 5V e 3.3V: per alimentare altri componenti.
        
    - Vin: per fornire tensione esterna.
        
- **Pin di ingresso analogico (A0-A5)**: ricevono segnali analogici (0-5V, valori 0-1023).
    
- **Pin di I/O digitale (0-13)**: configurabili come ingresso/uscita digitale (HIGH/LOW), alcuni supportano **PWM** (~).
    
- **Pulsante di reset**: riavvia il programma sulla scheda.
    
- **LED indicatori**:
    
    - **ON**: indica l'alimentazione.
        
    - **TX/RX**: lampeggiano durante la comunicazione seriale.
        
    - **LED utente** (collegato al PIN 13): utilizzabile nei progetti.
        

### **Componenti esterni utili**

- **Breadboard**: basetta con fori per il montaggio dei circuiti senza saldature.
    
- **LED**: con due terminali (_anodo_ +, _catodo_ -). Richiedono una **resistenza** in serie per evitare danni.
    
- **Pulsanti**: necessitano di **resistenze pull-up/down** per funzionare correttamente.
    
- **Resistori**: regolano il flusso di corrente (**valori in Ohm Ω**).
    
- **Potenziometri e trimmer**: resistenze variabili per segnali analogici.
    
- **Fotoreistenze**: variano la resistenza in base alla luce.
    
- **Buzzer**: emettono suoni alimentandoli con segnali elettrici.
    
- **LED RGB**: combinano tre colori (rosso, verde, blu) per generare vari colori.
    

---

## Sezione 3: Panoramica sull'Ambiente di Programmazione

L'IDE di Arduino è disponibile per **Windows, macOS e Linux**.

### **Struttura base di un programma (Sketch)**

Ogni sketch Arduino deve contenere due funzioni principali:

```cpp
void setup() {
  // Viene eseguita una volta all'avvio per configurare i pin
}

void loop() {
  // Viene eseguita continuamente
}
```

### **Funzionalità principali dell'IDE**

- **Verifica (✔)**: controlla il codice per errori.
    
- **Carica (→)**: trasferisce il codice sulla scheda.
    
- **Monitor Seriale**: permette la comunicazione seriale con la scheda.
    
- **Esempi predefiniti**: forniti nel menu _File > Esempi_.
    

### **Concetti chiave del linguaggio Arduino (C/C++)**

- **Variabili**: memorizzano dati (es. `int`, `float`, `bool`).
    
- **Commenti**: `// commento` (singola riga) e `/* commento */` (multi-linea).
    
- **Operatori**: `=`, `==`, `!=`, `+`, `-`, `*`, `/`, `&&`, `||`.
    
- **Condizioni**: `if`, `else`, `switch-case`.
    
- **Cicli**: `for`, `while`, `do-while`.
    
- **Array**: liste di variabili dello stesso tipo.
    
- **Librerie (`#include`)**: estendono le funzionalità.
    

---

## Sezione 4: Esempi Pratici e Applicazioni di Base

### **1. Lampeggio del LED Integrato (PIN 13)**

**Concetti:** output digitale, `digitalWrite()`, `delay()`.

#### **Codice**

```cpp
void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}
```

**Circuito:** LED integrato, nessun componente aggiuntivo.

---

### **2. Controllo di un LED Esterno**

**Concetti:** uso della breadboard, resistenze, output digitale variabile.

#### **Codice**

```cpp
int ledPin = 9;
int ritardo = 500;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);
  delay(ritardo);
  digitalWrite(ledPin, LOW);
  delay(ritardo);
}
```

**Circuito:** LED su **PIN 9**, resistore da **220Ω** in serie.

---

### **3. Controllo di un LED con un Pulsante**

**Concetti:** input digitale, `digitalRead()`, resistenze pull-down.

#### **Codice**

```cpp
int ledPin = 9;
int pulsantePin = 2;

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(pulsantePin, INPUT);
}

void loop() {
  if (digitalRead(pulsantePin) == HIGH) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
  delay(10); // Anti-rimbalzo
}
```

**Circuito:** pulsante tra **PIN 2 e 5V**, **resistore pull-down** da **100kΩ** verso GND.
