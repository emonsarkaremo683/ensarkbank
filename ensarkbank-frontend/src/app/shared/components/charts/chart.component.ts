import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="chart-wrapper">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      padding: 20px;
      height: 100%;
    }
    .chart-title {
      margin: 0 0 16px;
      font-size: 15px;
      font-weight: 600;
      color: #f1f5f9;
    }
    .chart-wrapper {
      position: relative;
      width: 100%;
      height: 280px;
    }
    canvas {
      width: 100% !important;
      height: 100% !important;
    }
  `]
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() title = '';
  @Input() chartType: 'line' | 'bar' | 'pie' | 'doughnut' = 'line';
  @Input() labels: string[] = [];
  @Input() datasets: { label: string; data: number[]; color?: string }[] = [];
  @Input() height = 280;

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart && (changes['labels'] || changes['datasets'] || changes['chartType'])) {
      this.chart.destroy();
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private renderChart(): void {
    if (!this.chartCanvas || !this.labels.length) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const colors = [
      'rgba(201, 168, 76, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(249, 115, 22, 0.8)',
      'rgba(6, 182, 212, 0.8)',
      'rgba(234, 179, 8, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(20, 184, 166, 0.8)'
    ];

    const borderColors = colors.map(c => c.replace('0.8', '1'));

    if (this.chartType === 'line') {
      const config: ChartConfiguration = {
        type: 'line',
        data: {
          labels: this.labels,
          datasets: this.datasets.map((ds, i) => ({
            label: ds.label,
            data: ds.data,
            borderColor: ds.color || colors[i % colors.length],
            backgroundColor: (ds.color || colors[i % colors.length]).replace('0.8', '0.1'),
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
            borderWidth: 2
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: this.datasets.length > 1, labels: { color: '#94a3b8', font: { size: 11 } } }
          },
          scales: {
            x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
            y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } }
          }
        }
      };
      this.chart = new Chart(ctx, config);
    } else if (this.chartType === 'bar') {
      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels: this.labels,
          datasets: this.datasets.map((ds, i) => ({
            label: ds.label,
            data: ds.data,
            backgroundColor: ds.color || colors[i % colors.length],
            borderColor: ds.color || borderColors[i % borderColors.length],
            borderWidth: 1,
            borderRadius: 4
          }))
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: this.datasets.length > 1, labels: { color: '#94a3b8', font: { size: 11 } } }
          },
          scales: {
            x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.04)' } }
          }
        }
      };
      this.chart = new Chart(ctx, config);
    } else {
      const config: ChartConfiguration = {
        type: this.chartType === 'doughnut' ? 'doughnut' : 'pie',
        data: {
          labels: this.labels,
          datasets: [{
            data: this.datasets[0]?.data || [],
            backgroundColor: colors.slice(0, this.labels.length),
            borderColor: 'rgba(10, 22, 40, 0.8)',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { color: '#94a3b8', font: { size: 11 }, padding: 12, usePointStyle: true, pointStyleWidth: 10 }
            }
          }
        }
      };
      this.chart = new Chart(ctx, config);
    }
  }
}
