import { Component, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CompareService } from '../../../core/services/compare.service';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.css']
})
export class CompareComponent {
  products = signal<any[]>([]);
  
  private sanitizer = inject(DomSanitizer);
  public compareService = inject(CompareService);

  constructor() {
    effect(() => {
      const ids = this.compareService.compareIds();
      if (ids && ids.length > 0) {
        this.compareService.getCompareDetails().subscribe({
          next: (res: any) => {
            if (res.success) {
              const processed = res.products.map((p: any) => ({
                ...p,
                displaySpecs: this.formatSpecs(p.specifications)
              }));
              this.products.set(processed);
            }
          },
          error: (err) => console.error('API Error:', err)
        });
      } else {
        this.products.set([]);
        if (this.compareService.showModal()) this.compareService.closeModal();
      }
    });
  }

  // Biến chuỗi JSON thành bảng HTML đẹp mắt
  formatSpecs(specsString: string): SafeHtml {
    try {
      const specsObj = typeof specsString === 'string' ? JSON.parse(specsString) : specsString;
      let html = '<table style="width:100%; border-collapse: collapse; font-size: 13px;">';
      for (const [key, value] of Object.entries(specsObj)) {
        html += `
          <tr style="border-bottom: 1px solid #f0f0f0;">
            <td style="padding: 10px 5px; font-weight: 600; color: #2c3e50; text-align: left;">${key}</td>
            <td style="padding: 10px 5px; color: #666; text-align: right;">${value}</td>
          </tr>`;
      }
      html += '</table>';
      return this.sanitizer.bypassSecurityTrustHtml(html);
    } catch (e) {
      return specsString || 'Chưa có thông số';
    }
  }

  toggleModal() {
    this.compareService.toggleModal();
  }
}
