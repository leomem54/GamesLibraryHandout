# Testkonzept – GamesLibrary

## 1. Testobjekt und Teststrategie

In diesem Projekt testen wir unsere GamesLibrary aus Modul 321. Die Anwendung besteht aus einem Backend und einem Frontend. Die automatisierten Tests werden hauptsächlich im Backend durchgeführt, da dort die Verarbeitung und Verwaltung der Spiele stattfindet.

Wir möchten sicherstellen, dass die wichtigsten Funktionen auch nach Änderungen weiterhin funktionieren.

Folgende Funktionen werden geprüft:

- Spiele aus der Datenbank abrufen
- Spiele anhand ihrer ID suchen
- Spiele erstellen und bearbeiten
- Ungültige Eingaben erkennen
- Spieltitel korrekt formatieren

Mögliche Risiken sind fehlerhafte Spielinformationen, ungültige Eingaben und Änderungen, durch die bestehende Funktionen nicht mehr richtig funktionieren.

## 2. Teststufen

### Unit-Tests

Mit JUnit 5 und Mockito testen wir einzelne Klassen und Methoden. Dabei ersetzen wir beispielsweise das GameRepository durch ein Mock-Objekt, damit keine echte Datenbank benötigt wird.

Ein Beispiel dafür ist GameServiceTest.

### Integrationstests

Hier überprüfen wir, ob mehrere Komponenten zusammen funktionieren. Dafür verwenden wir Spring Boot und die H2-Datenbank.

### Schnittstellentests

Die REST-Schnittstellen der GamesLibrary werden überprüft, damit die Anfragen und Antworten korrekt funktionieren. Dafür können wir MockMvc und Postman verwenden.

## 3. Entwicklungsvorgehen

Wir arbeiten mit Test-Driven Development (TDD). Das bedeutet, dass wir zuerst einen Test schreiben, der fehlschlägt. Danach ergänzen wir den notwendigen Code, bis der Test erfolgreich ist.

Beim TitleNormalizer haben wir vier TDD-Zyklen durchgeführt:

1. Leerzeichen am Anfang und Ende entfernen
2. Mehrere Leerzeichen zusammenfassen
3. Ersten Buchstaben grossschreiben
4. Leere und ungültige Titel ablehnen

Für jeden Zyklus wurden die rote und die grüne Phase mit separaten Commits dokumentiert.

## 4. CI/CD-Pipeline

Wir verwenden GitHub Actions, um die Tests automatisch auszuführen.

Die Pipeline befindet sich in:

.github/workflows/ci.yml

Bei jedem Push oder Pull Request werden die Tests im Ordner backend gestartet.

Wenn alle Tests erfolgreich sind, wird der Deploy-Platzhalter ausgeführt. Falls ein Test fehlschlägt, wird dieser Schritt übersprungen.

Wir haben die Pipeline mit einem absichtlich fehlerhaften Test überprüft. Dabei wurde der Testlauf rot und der Deploy-Schritt nicht ausgeführt. Nach der Korrektur waren beide Schritte wieder grün.

## 5. Testumgebung und Werkzeuge

Wir verwenden folgende Werkzeuge:

- Visual Studio Code für die Entwicklung
- Java und Maven für das Backend
- JUnit 5 für automatisierte Tests
- Mockito für Mock-Objekte
- Spring Boot und H2 für Integrationstests
- GitHub für die Versionsverwaltung
- GitHub Actions für die automatisierte Testausführung

## 6. Testdurchführung

Die Tests können lokal im Ordner backend mit folgendem Befehl ausgeführt werden:

.\mvnw.cmd test

Zusätzlich werden sie automatisch über GitHub Actions gestartet.

Ein Test gilt als erfolgreich, wenn das erwartete Ergebnis erreicht wird und keine Fehler auftreten.

## 7. Fehlerbehandlung

Wenn ein Test fehlschlägt, überprüfen wir zuerst die Fehlermeldung und versuchen, die Ursache zu finden.

Anschliessend beheben wir den Fehler und führen die Tests erneut aus.

Fehler sollen nachvollziehbar dokumentiert werden, damit dieselben Probleme später schneller erkannt und behoben werden können.
