<template>
  <MainNav>
    <v-row>
      <v-col>
        <div class="text-center mb-6">
          <v-img
            src="/icon.png"
            max-width="200"
            class="mx-auto mb-4"
          ></v-img>
          <h2 class="mb-4">OpenFischer</h2>
        </div>

        <p class="mb-6">
          OpenFischer ist der Versuch, ein freies, nicht-kommerzielles Tool zur Verfügung zu stellen, um
          angehende Anwärterinnen und Anwärter bei der Vorbereitung für den <em>bayerischen</em> Fischereischein zu unterstützen.
          Umgesetzt als <a href="https://de.wikipedia.org/wiki/Progressive_Web_App" target="_blank">PWA</a>
          (<strong>P</strong>rogressive <strong>W</strong>eb <strong>A</strong>pp),
          werden sämtliche Daten lokal auf Ihrem Gerät gespeichert. Aus diesem Grund ist kein Nutzer-Account nötig und die Offline-Verwendung
          der App möglich.
        </p>

        <v-expansion-panels>
          <!-- Question Source -->
          <v-expansion-panel>
            <v-expansion-panel-title>
              Woher stammen die Fragen?
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <p>
                Alle Fragen für die bayerische Fischereiprüfung stehen online zur Verfügung,
                zu finden unter diesem Link:
                <a href="https://www.lfl.bayern.de/ifi/fischerpruefung/125173/index.php" target="_blank">
                  https://www.lfl.bayern.de/ifi/fischerpruefung/125173/index.php
                </a>
              </p>
              <p>
                Entnommen wurde der Stand 2018-2021/22. Dort zu entnehmen sind ebenfalls die <strong>Nutzungsbedingungen:</strong>
              </p>
              <p class="text-caption">
                <small>
                  Die Fragen und Antworttexte sind frei verfügbar.
                  Die Bilder zu den Fragen sind urheberrechtlich geschützt. Die kommerzielle Verwertung in printform oder digital darf nur mit Genehmigung des jeweiligen Bildautors erfolgen.
                  <br><br>
                  <strong>Bildnachweis:</strong>
                  <ul>
                    <li>B 1.1: LfL, Institut für Fischerei, Starnberg</li>
                    <li>B 1.2 – 1.24: Atelier Ziegler, Kitzingen</li>
                    <li>B 2.1 – 2.6: Vereinigung Deutscher Gewässerschutz e.V.</li>
                    <li>B 3.1 – 3.9 und 3.11 – 3.17: Fa. Cormoran / Fishermans Partner</li>
                    <li>B 3.10: Landesfischereiverband Bayern e.V.</li>
                    <li>B 4.1 – 4.7: Andreas Glock, Geesthacht</li>
                  </ul>
                </small>
              </p>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Source Code -->
          <v-expansion-panel>
            <v-expansion-panel-title>
              Wo finde ich den Quellcode?
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <p>
                Der Quellcode dieser Anwendung ist hier einsehbar:
                <a href="https://github.com/drossner/openfischer" target="_blank">
                  https://github.com/drossner/openfischer
                </a>
              </p>
              <p>
                Die Entwicklung ist ein Nebenprojekt und daher alles andere als perfekt. Jede Form von Mitarbeit ist erwünscht:
                Sei es durch weitere Code-Verbesserungen oder dem Hinzufügen von Texterläuterungen zu den jeweiligen Fragen. Auch Feedback
                ist möglich und erwünscht.
              </p>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Impressum -->
          <v-expansion-panel>
            <v-expansion-panel-title>
              Warum gibt es kein Impressum?
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <p>
                Es handelt sich hier um eine <strong>rein private</strong> Webseite. Es gibt kein kommerzielles
                Interesse, weder durch den Verkauf von Leistungen/Produkten noch durch den Einsatz irgendeiner Form von Werbebannern
                oder Werbung generell. Der Kontakt ist über das verlinkte
                <a href="https://github.com/drossner/openfischer" target="_blank">Github-Repository</a>
                oder über diese Mail-Adresse möglich: openfischer at posteo de. (at und de entsprechend mit Punkten etc. einsetzen)
              </p>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </MainNav>
</template>

<script setup lang="ts">
// About page - static content
</script>

<style scoped>
a {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  word-break: break-word;
  overflow-wrap: break-word;
}

a:hover {
  text-decoration: underline;
}
</style>
