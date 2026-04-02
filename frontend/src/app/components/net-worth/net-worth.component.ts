import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Input, OnChanges } from '@angular/core';
import * as d3 from 'd3';
import { CommonModule } from '@angular/common';

interface TreemapNode {
    name: string;
    value: number;
    type: string;
    color: string;
}

@Component({
    selector: 'we-net-worth',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="bg-wealth-card rounded-2xl p-6 border border-gray-800 animate-fade-in">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-xl font-bold text-white">Net Worth</h2>
          <p class="text-sm text-gray-400">Portfolio allocation breakdown</p>
        </div>
        <div class="text-right">
          <div class="text-3xl font-bold text-white">
            ₹{{ (totalNetWorth | number:'1.0-0') || '0' }}
          </div>
          <div [class]="gainLossPercent >= 0 ? 'text-wealth-green text-sm font-semibold' : 'text-wealth-red text-sm font-semibold'">
            {{ gainLossPercent >= 0 ? '+' : '' }}{{ gainLossPercent | number:'1.2-2' }}% overall
          </div>
        </div>
      </div>

      <!-- Treemap Container -->
      <div #treemapContainer class="w-full rounded-xl overflow-hidden cursor-pointer" style="height:380px">
        <svg #treemapSvg class="w-full h-full"></svg>
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap gap-3 mt-4">
        <div *ngFor="let item of legendItems" class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-sm" [style.background]="item.color"></div>
          <span class="text-xs text-gray-400">{{ item.name }}</span>
        </div>
      </div>
    </div>
  `
})
export class NetWorthComponent implements AfterViewInit, OnChanges {
    @ViewChild('treemapSvg') svgRef!: ElementRef<SVGElement>;
    @ViewChild('treemapContainer') containerRef!: ElementRef<HTMLDivElement>;

    @Input() allocationByType: Record<string, number> = {};
    @Input() totalNetWorth: number = 0;
    @Input() gainLossPercent: number = 0;

    private readonly assetColors: Record<string, string> = {
        STOCK: '#6366f1',
        MUTUAL_FUND: '#8b5cf6',
        ETF: '#a78bfa',
        NPS: '#10b981',
        EPF: '#34d399',
        PPF: '#6ee7b7',
        FD: '#f59e0b',
        BONDS: '#fcd34d',
        GOLD: '#fbbf24',
        CASH: '#94a3b8',
        CRYPTO: '#ef4444',
        REAL_ESTATE: '#f97316',
    };

    legendItems: { name: string; color: string }[] = [];

    ngAfterViewInit(): void {
        this.renderTreemap();
    }

    ngOnChanges(): void {
        if (this.svgRef) {
            this.renderTreemap();
        }
    }

    private renderTreemap(): void {
        const svg = d3.select(this.svgRef.nativeElement);
        svg.selectAll('*').remove();

        const container = this.containerRef.nativeElement;
        const width = container.clientWidth;
        const height = 380;

        const data = Object.entries(this.allocationByType)
            .filter(([, v]) => v > 0)
            .map(([k, v]) => ({
                name: k.replace('_', ' '),
                value: v,
                type: k,
                color: this.assetColors[k] || '#64748b'
            }));

        if (data.length === 0) {
            // Render placeholder
            svg.attr('viewBox', `0 0 ${width} ${height}`);
            svg.append('text')
                .attr('x', width / 2).attr('y', height / 2)
                .attr('text-anchor', 'middle')
                .attr('fill', '#4b5563')
                .attr('font-size', '16px')
                .text('Add holdings to see portfolio breakdown');
            return;
        }

        this.legendItems = data.map(d => ({ name: d.name, color: d.color }));

        const totalValue = data.reduce((s, d) => s + d.value, 0);
        const root = d3.hierarchy<any>({ children: data }).sum((d: any) => d.value);
        d3.treemap<any>().size([width, height]).padding(4).round(true)(root);

        svg.attr('viewBox', `0 0 ${width} ${height}`);

        const cells = svg.selectAll('g')
            .data(root.leaves())
            .join('g')
            .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`);

        // Background rect with gradient-like opacity
        cells.append('rect')
            .attr('width', (d: any) => Math.max(0, d.x1 - d.x0))
            .attr('height', (d: any) => Math.max(0, d.y1 - d.y0))
            .attr('fill', (d: any) => d.data.color)
            .attr('opacity', 0.85)
            .attr('rx', 6)
            .on('mouseover', function () { d3.select(this).attr('opacity', 1); })
            .on('mouseout', function () { d3.select(this).attr('opacity', 0.85); });

        // Label (only if cell is big enough)
        cells.filter((d: any) => (d.x1 - d.x0) > 60 && (d.y1 - d.y0) > 40)
            .append('text')
            .attr('x', 10).attr('y', 22)
            .attr('fill', 'white').attr('font-weight', '600').attr('font-size', '13px')
            .text((d: any) => d.data.name);

        cells.filter((d: any) => (d.x1 - d.x0) > 60 && (d.y1 - d.y0) > 60)
            .append('text')
            .attr('x', 10).attr('y', 40)
            .attr('fill', 'rgba(255,255,255,0.75)').attr('font-size', '12px')
            .text((d: any) => `${(d.data.value * 100).toFixed(1)}%`);
    }
}
