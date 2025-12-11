import { Component, Input, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  selector: 'app-salary-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './salary-chart.component.html',
  styleUrls: ['./salary-chart.component.css']
})
export class SalaryChartComponent implements OnChanges, AfterViewInit {
  @Input() data: DistributionDataPoint[] = [];
  @Input() monSalaire: number = 0;
  @Input() mediane: number = 0;
  @Input() moyenne: number = 0;
  @Input() deciles: Decile[] = [];

  @ViewChild('chartCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private tooltip: HTMLDivElement | null = null;

  ngAfterViewInit() {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.setupCanvas();
    this.drawChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.ctx && this.data.length > 0) {
      this.drawChart();
    }
  }

  private setupCanvas() {
    const container = this.canvas.parentElement!;
    this.canvas.width = container.clientWidth;
    this.canvas.height = 400;
    
    // Setup tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'chart-tooltip';
    this.tooltip.style.position = 'absolute';
    this.tooltip.style.display = 'none';
    this.tooltip.style.backgroundColor = 'white';
    this.tooltip.style.border = '1px solid #ccc';
    this.tooltip.style.borderRadius = '4px';
    this.tooltip.style.padding = '8px';
    this.tooltip.style.pointerEvents = 'none';
    this.tooltip.style.zIndex = '1000';
    this.tooltip.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    container.style.position = 'relative';
    container.appendChild(this.tooltip);

    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => this.hideTooltip());
  }

  private drawChart() {
    if (!this.ctx || this.data.length === 0) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    const padding = { top: 40, right: 40, bottom: 60, left: 70 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // Find min/max values
    const minSalaire = this.data[0].salaire;
    const maxSalaire = this.data[this.data.length - 1].salaire;
    const maxDensite = Math.max(...this.data.map(d => d.densite));

    // Scale functions
    const scaleX = (salaire: number) => {
      return padding.left + ((salaire - minSalaire) / (maxSalaire - minSalaire)) * chartWidth;
    };

    const scaleY = (densite: number) => {
      return padding.top + chartHeight - (densite / maxDensite) * chartHeight;
    };

    // Draw grid
    this.ctx.strokeStyle = '#e5e7eb';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight * i) / 5;
      this.ctx.beginPath();
      this.ctx.moveTo(padding.left, y);
      this.ctx.lineTo(width - padding.right, y);
      this.ctx.stroke();
    }

    // Draw area chart
    this.ctx.fillStyle = 'rgba(136, 132, 216, 0.3)';
    this.ctx.strokeStyle = '#8884d8';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(scaleX(this.data[0].salaire), padding.top + chartHeight);
    
    this.data.forEach((point, i) => {
      const x = scaleX(point.salaire);
      const y = scaleY(point.densite);
      if (i === 0) {
        this.ctx.lineTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    
    this.ctx.lineTo(scaleX(this.data[this.data.length - 1].salaire), padding.top + chartHeight);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Draw reference lines
    this.drawReferenceLine(scaleX(this.monSalaire), '#ef4444', 'Mon Salaire', 3);
    this.drawReferenceLine(scaleX(this.mediane), '#3b82f6', 'Médiane', 2, true);
    this.drawReferenceLine(scaleX(this.moyenne), '#10b981', 'Moyenne', 2, true);

    // Draw deciles
    this.deciles.forEach(d => {
      this.drawReferenceLine(scaleX(d.valeur), '#9ca3af', d.decile, 1, true, true);
    });

    // Draw axes
    this.drawAxes(padding, chartWidth, chartHeight, minSalaire, maxSalaire, maxDensite);
  }

  private drawReferenceLine(x: number, color: string, label: string, lineWidth: number, dashed = false, small = false) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    
    if (dashed) {
      this.ctx.setLineDash([5, 5]);
    } else {
      this.ctx.setLineDash([]);
    }

    this.ctx.beginPath();
    this.ctx.moveTo(x, 40);
    this.ctx.lineTo(x, this.canvas.height - 60);
    this.ctx.stroke();

    this.ctx.setLineDash([]);

    // Draw label
    this.ctx.fillStyle = color;
    this.ctx.font = small ? '10px sans-serif' : 'bold 12px sans-serif';
    this.ctx.textAlign = 'center';
    const labelY = small ? this.canvas.height - 45 : 30;
    this.ctx.fillText(label, x, labelY);
  }

  private drawAxes(padding: any, chartWidth: number, chartHeight: number, minSalaire: number, maxSalaire: number, maxDensite: number) {
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.fillStyle = '#000';
    this.ctx.font = '12px sans-serif';

    // X-axis
    this.ctx.beginPath();
    this.ctx.moveTo(padding.left, padding.top + chartHeight);
    this.ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    this.ctx.stroke();

    // X-axis labels
    this.ctx.textAlign = 'center';
    for (let i = 0; i <= 5; i++) {
      const salaire = minSalaire + ((maxSalaire - minSalaire) * i) / 5;
      const x = padding.left + (chartWidth * i) / 5;
      const y = padding.top + chartHeight + 20;
      this.ctx.fillText(`${(salaire / 1000).toFixed(0)}k`, x, y);
    }

    // X-axis title
    this.ctx.font = 'bold 12px sans-serif';
    this.ctx.fillText('Salaire Annuel Brut (€)', padding.left + chartWidth / 2, this.canvas.height - 10);

    // Y-axis
    this.ctx.beginPath();
    this.ctx.moveTo(padding.left, padding.top);
    this.ctx.lineTo(padding.left, padding.top + chartHeight);
    this.ctx.stroke();

    // Y-axis labels
    this.ctx.font = '12px sans-serif';
    this.ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const densite = (maxDensite * (5 - i)) / 5;
      const y = padding.top + (chartHeight * i) / 5;
      this.ctx.fillText(densite.toFixed(2), padding.left - 10, y + 4);
    }

    // Y-axis title
    this.ctx.save();
    this.ctx.translate(15, padding.top + chartHeight / 2);
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.font = 'bold 12px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Densité de probabilité', 0, 0);
    this.ctx.restore();
  }

  private handleMouseMove(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const padding = { top: 40, right: 40, bottom: 60, left: 70 };
    const chartWidth = this.canvas.width - padding.left - padding.right;

    if (x >= padding.left && x <= padding.left + chartWidth &&
        y >= padding.top && y <= padding.top + (this.canvas.height - padding.top - padding.bottom)) {
      
      const minSalaire = this.data[0].salaire;
      const maxSalaire = this.data[this.data.length - 1].salaire;
      const salaire = minSalaire + ((x - padding.left) / chartWidth) * (maxSalaire - minSalaire);

      const closestPoint = this.data.reduce((prev, curr) => 
        Math.abs(curr.salaire - salaire) < Math.abs(prev.salaire - salaire) ? curr : prev
      );

      this.showTooltip(event.clientX, event.clientY, closestPoint);
    } else {
      this.hideTooltip();
    }
  }

  private showTooltip(x: number, y: number, point: DistributionDataPoint) {
    if (!this.tooltip) return;

    this.tooltip.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">${point.salaire.toLocaleString()}€</div>
      <div style="font-size: 12px; color: #666;">Densité: ${point.densite.toFixed(2)}</div>
      <div style="font-size: 12px; color: #666;">Percentile: ${point.cumulative.toFixed(1)}%</div>
    `;
    this.tooltip.style.display = 'block';
    this.tooltip.style.left = (x + 10) + 'px';
    this.tooltip.style.top = (y - 60) + 'px';
  }

  private hideTooltip() {
    if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
  }
}

