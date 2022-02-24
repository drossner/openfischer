<template>
  <MainNav>
    <b-row>
      <b-col>
        <b-img center block class="header-img" :src="'icon.png'"></b-img>
        <h3 center >OpenFischer</h3>
        <p>OpenFischer ist der Versuch, ein freies, nicht-kommerzielles Tool zur Verfügung zu stellen, um
        angehende Anwärterinnen und Anwärter für den <em>bayerischen</em> Fischereischein zu unterstützen.
          Umgesetzt als <a href="https://de.wikipedia.org/wiki/Progressive_Web_App">PWA</a> (<b>P</b>rogressive <b>W</b>eb <b>A</b>pp),
        werden sämtliche Daten lokal auf Ihrem Gerät gespeichert. Aus diesem Grund ist kein Nutzer-Account nötig und die Offline-Verwendung
          der App möglich. <small>Letzteres, noch mit kleinen Fehlern behaftet.</small></p>

        <div class="accordion" role="tablist">
          <b-card no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block v-b-toggle.accordion-1 variant="secondary">Woher stammen die Fragen?</b-button>
            </b-card-header>
            <b-collapse id="accordion-1" accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <b-card-text>Alle fragen für die bayerische Fischereiprüfung stehen online zur Verfügung,
                zu finden unter diesem Link: <a href="https://www.lfl.bayern.de/ifi/fischerpruefung/125173/index.php">https://www.lfl.bayern.de/ifi/fischerpruefung/125173/index.php</a>
                </b-card-text>
                <b-card-text>Entnommen wurde der Stand 2018-2021/22. Dort zu entnehmen sind ebenfalls die <b>Nutzungsbedingungen:</b></b-card-text>
                <b-card-text><small>Die Fragen und Antworttexte sind frei verfügbar.
                  Die Bilder zu den Fragen sind urheberrechtlich geschützt. Die kommerzielle Verwertung in printform oder digital darf nur mit Genehmigung des jeweiligen Bildautors erfolgen.
                  Bildnachweis:
                  <ul>
                    <li>B 1.1: LfL, Institut für Fischerei, Starnberg</li>
                    <li>B 1.2 – 1.24: Atelier Ziegler, Kitzingen</li>
                    <li>B 2.1 – 2.6: Vereinigung Deutscher Gewässerschutz e.V.</li>
                    <li>B 3.1 – 3.9 und 3.11 – 3.17: Fa. Cormoran / Fishermans Partner</li>
                    <li>B 3.10: Landesfischereiverband Bayern e.V.</li>
                    <li>B 4.1 – 4.7: Andreas Glock, Geesthacht</li>
                  </ul>
                  </small></b-card-text>
              </b-card-body>
            </b-collapse>
          </b-card>

          <b-card no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block v-b-toggle.accordion-2 variant="secondary">Wo finde ich den Quellcode?</b-button>
            </b-card-header>
            <b-collapse id="accordion-2" accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <b-card-text>Der Quellcode dieser Anwendung ist hier einsehbar: <a href="https://github.com/drossner/openfischer">https://github.com/drossner/openfischer</a></b-card-text>
                <b-card-text>Die Entwicklung ist ein Nebenprojekt und daher alles andere als perfekt. Jede Form von Mitarbeit ist erwünscht:
                Sei es durch weitere Code-Verbesserungen oder dem Hinzufügen von Texterläuterungen zu den jeweiligen Fragen. Auch Feedback
                ist möglich und erwünscht.</b-card-text>
              </b-card-body>
            </b-collapse>
          </b-card>

          <b-card no-body class="mb-1">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block v-b-toggle.accordion-3 variant="secondary">Warum gibt es kein Impressum?</b-button>
            </b-card-header>
            <b-collapse id="accordion-3" accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <b-card-text>Es handelt sich hier um eine <b>rein private</b> Webseite. Es gibt kein kommerzielles
                Interesse, weder durch den Verkauf von Leistungen/Produkten noch irgendeine Form von Werbebannern
                oder Werbung generell. Der Kontakt ist über das verlinkte <a href="https://github.com/drossner/openfischer">Github-Repository</a>
                oder über diese Mail-Addresse möglich: openfischer at posteo de. (at und de entsprechend mit Punkten etc. einsetzen)</b-card-text>
              </b-card-body>
            </b-collapse>
          </b-card>
        </div>
      </b-col>
    </b-row>

  </MainNav>
</template>

<script>
export default {
  name: "about"
}
</script>

<style scoped>
.header-img {
  max-width: 30%;
  height: auto;
}
</style>
