# Dispensa di Studio su Arduino  
**Fonte principale**: [Playlist YouTube - Introduzione ad Arduino](https://youtube.com/playlist?list=PLoYHAvGCPCFSaTJBVylc15XkcqAajgDB3)  

---

## Indice  
1. [Introduzione ad Arduino](#1-introduzione-ad-arduino)  
2. [Componenti Hardware](#2-componenti-hardware)  
3. [Programmazione e Ambiente IDE](#3-programmazione-e-ambiente-ide)  
4. [Esempi Pratici](#4-esempi-pratici)  
5. [Esercitazioni e Auto-Valutazione](#5-esercitazioni-e-auto-valutazione)  
6. [Analisi Critica e Approfondimenti](#6-analisi-critica-e-approfondimenti)  

---

## 1. Introduzione ad Arduino  
### 1.1 Cos’è Arduino?  
- **Definizione**: Piattaforma open-source per prototipazione elettronica, basata su hardware (schede) e software (IDE).  
- **Vantaggi**:  
  - Basso costo e flessibilità.  
  - Comunità globale di supporto.  
  - Compatibile con Windows, macOS, Linux.  

### 1.2 Architettura Hardware  
- **Microcontrollore**: ATmega328 (Arduino Uno) con 32 KB di memoria flash.  
- **Pin**:  
  - 14 digitali (6 PWM), 6 analogici.  
  - Alimentazione: 5V (USB) o 7-12V (esterna).  

---

## 2. Componenti Hardware  
### 2.1 Schede Comuni  
| Modello   | Pin Digitali | Memoria Flash | Dimensioni |  
|-----------|--------------|---------------|------------|  
| Uno       | 14           | 32 KB         | Standard   |  
| Nano      | 14           | 32 KB         | Compatta   |  
| Mega 2560 | 54           | 256 KB        | Large      |  

### 2.2 Sensori e Attuatori  
- **Input**:  
  - Fotoresistore (luce), termistore (temperatura), pulsante.  
- **Output**:  
  - LED, buzzer, servomotore (angolo 0-180°).  

### 2.3 Elettronica di Base  
- **Legge di Ohm**: \( V = R \cdot I \) (esempio: calcolo resistenza per un LED).  
- **Circuiti Protetti**:  
  - Resistenza in serie con LED: \( R = \frac{V_{sorgente} - V_{LED}}{I_{LED}} \).  

---

## 3. Programmazione e Ambiente IDE  
### 3.1 Struttura di un Sketch  
```cpp  
void setup() {  
  pinMode(13, OUTPUT); // Configura il pin 13 come output  
}  

void loop() {  
  digitalWrite(13, HIGH); // Accende il LED  
  delay(1000);  
  digitalWrite(13, LOW);  // Spegne il LED  
  delay(1000);  
}  
```  

### 3.2 Funzioni Principali  
| Funzione           | Descrizione                          |  
|--------------------|--------------------------------------|  
| `digitalRead()`    | Legge un valore digitale (HIGH/LOW). |  
| `analogWrite()`    | Genera segnale PWM (0-255).          |  
| `Serial.println()` | Stampa dati sul serial monitor.      |  

---

## 4. Esempi Pratici  
### 4.1 Controllo di un Servomotore  
**Circuitazione**:  
- Servo collegato a pin PWM (es. D9), alimentazione 5V.  
**Codice**:  
```cpp  
#include <Servo.h>  
Servo mioServo;  

void setup() {  
  mioServo.attach(9);  
}  

void loop() {  
  mioServo.write(90); // Posizione neutra  
  delay(1000);  
}  
```  

### 4.2 Lettura Sensore di Temperatura (LM35)  
**Formula**:  
\( T (°C) = \frac{\text{valore analogico} \times 5}{1023} \times 100 \).  

---

## 5. Esercitazioni e Auto-Valutazione  
### 5.1 Esercizi  
1. **Allarme Fotoresistente**:  
   - Accendi un buzzer se la luce ambientale scende sotto una soglia.  
2. **Termostato**:  
   - Attiva una ventina se la temperatura supera 30°C.  

### 5.2 Domande di Verifica  
1. Cosa succede se si collega un LED senza resistenza?  
2. Qual è la differenza tra `delay()` e `millis()`?  

---

## 6. Analisi Critica e Approfondimenti  
### 6.1 Punti di Forza dei Video  
- **Chiarezza**: Spiegazioni graduali, ideali per principianti.  
- **Pragmatismo**: Esempi immediatamente applicabili.  

### 6.2 Suggerimenti per Migliorare  
- Aggiungere esercizi di debug guidato.  
- Introdurre progetti interdisciplinari (es. Arduino + Python).  

### 6.3 Risorse Consigliate  
- **Libri**: "Arduino Cookbook" di Michael Margolis.  
- **Siti**: [Arduino Project Hub](https://create.arduino.cc/projecthub).  
