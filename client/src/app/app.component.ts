import { Component, OnInit } from '@angular/core';
import {SalaryChartComponent} from "./salary-chart/salary-chart.component";
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";

interface DistributionDataPoint {
  salaire: number;
  densite: number;
  cumulative: number;
}

interface Decile {
  decile: string;
  valeur: number;
  percentile: number;
}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SalaryChartComponent, FormsModule, NgForOf, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  moyenne = 0;
  mediane = 0;
  monSalaire = 0;
  skewness = 0;
  ecartType = 0;

  data: DistributionDataPoint[] = [];
  deciles: Decile[] = [];
  monPercentile = 0;
  ecartMediane = '0';
  ecartMoyenne = '0';
  moyenneTheorique = 0;

  Math = Math;

  ngOnInit() {
    this.updateDistribution();
  }

  onParameterChange() {
    this.updateDistribution();
  }

  private updateDistribution() {
    this.data = this.generateDistribution();
    this.deciles = this.calculateDeciles();
    this.calculateMetrics();
  }

  private generateDistribution(): DistributionDataPoint[] {
    const data: DistributionDataPoint[] = [];

    // Paramètres pour la distribution log-normale ajustée
    const mu = Math.log(this.mediane);
    // Combinaison de skewness et ecartType pour plus de contrôle
    const sigma = this.skewness * (1 + this.ecartType);

    const min = Math.max(20000, this.mediane * 0.5);
    const max = this.mediane * 2.5;
    const step = (max - min) / 150;

    for (let salary = min; salary <= max; salary += step) {
      const logSalary = Math.log(salary);
      const z = (logSalary - mu) / sigma;
      const density = (1 / (salary * sigma * Math.sqrt(2 * Math.PI))) *
        Math.exp(-0.5 * z * z);

      data.push({
        salaire: Math.round(salary),
        densite: density * 1000000,
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

    this.moyenneTheorique = this.data.reduce((sum, d) => sum + d.salaire * d.densite, 0) /
      this.data.reduce((sum, d) => sum + d.densite, 0);
  }

  formatNumber(value: number): string {
    return value.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  }

  getPositionText(): string {
    if (this.monPercentile < 25) return 'Très bas';
    if (this.monPercentile < 50) return 'En-dessous';
    return 'Au-dessus';
  }

  protected readonly parseFloat = parseFloat;
}

