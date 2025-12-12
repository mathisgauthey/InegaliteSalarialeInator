import {Component, OnInit} from '@angular/core';
import {SalaryChartComponent} from "./salary-chart/salary-chart.component";
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {DistributionDataPoint} from "./_models/datapoint";
import {Decile} from "./_models/decile";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SalaryChartComponent, FormsModule, NgForOf, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  moyenne: number = 0;
  mediane: number = 0;
  monSalaire: number = 0;

  data: DistributionDataPoint[] = [];
  deciles: Decile[] = [];
  monPercentile = 0;
  ecartMediane = '0';
  ecartMoyenne = '0';
  esperance: number = 0;
  ecartType: number = 0;
  variance: number = 0;
  asymetrie: number = 0;

  Math = Math;
  protected readonly parseFloat = parseFloat;

  ngOnInit() {
    this.updateDistribution();
  }

  onParameterChange() {
    this.updateDistribution();
  }

  formatNumber(value: number): string {
    return value.toLocaleString('fr-FR', {maximumFractionDigits: 3});
  }

  getPositionText(): string {
    if (this.monPercentile < 25) return 'Très bas';
    if (this.monPercentile < 50) return 'En-dessous';
    return 'Au-dessus';
  }

  private updateDistribution() {
    this.data = this.generateDistribution();
    this.deciles = this.calculateDeciles();
    this.calculateMetrics();
  }

  private generateDistribution(): DistributionDataPoint[] {
    const data: DistributionDataPoint[] = [];

    // Calcul de mu et sigma pour la distribution log-normale
    this.esperance = Math.log(this.mediane);
    this.ecartType = Math.sqrt(2 * (Math.log(this.moyenne) - this.esperance));
    this.variance = this.ecartType * this.ecartType;
    this.asymetrie = (Math.exp(this.variance) + 2) * Math.sqrt(Math.exp(this.variance) - 1);

    const min = 21621.6 // SMIC annuel brut
    const max = this.mediane * 2.5; // 2.5 fois la médiane, pour couvrir une large gamme de salaires
    const step = (max - min) / 100000;

    for (let salary = min; salary <= max; salary += step) {
      const logSalary = Math.log(salary);
      const z = (logSalary - this.esperance) / this.ecartType;
      const density = (1 / (salary * this.ecartType * Math.sqrt(2 * Math.PI))) *
        Math.exp(-0.5 * z * z);

      data.push({
        salaire: Math.round(salary),
        densite: density * 1000000, // Mise à l'échelle pour une meilleure visualisation
        cumulative: 0
      });
    }

    // Calculer la distribution cumulative
    let cumSum = 0;
    const totalDensity = data.reduce((sum, d) => sum + d.densite, 0);
    data.forEach(d => {
      cumSum += d.densite / totalDensity;
      d.cumulative = cumSum * 100;
    });

    return data;
  }

  private calculateDeciles(): Decile[] {
    const deciles: Decile[] = [];

    for (let i = 1; i <= 9; i++) {
      const targetPercentile = i * 10;
      const point = this.data.find(d => d.cumulative >= targetPercentile);
      if (point) {
        deciles.push({
          decile: `D${i}`,
          valeur: point.salaire,
          percentile: targetPercentile
        });
      }
    }

    return deciles;
  }

  private calculateMetrics() {
    const point = this.data.find(d => d.salaire >= this.monSalaire);
    this.monPercentile = point?.cumulative || 0;

    this.ecartMediane = ((this.monSalaire - this.mediane) / this.mediane * 100).toFixed(1);
    this.ecartMoyenne = ((this.monSalaire - this.moyenne) / this.moyenne * 100).toFixed(1);
  }
}

