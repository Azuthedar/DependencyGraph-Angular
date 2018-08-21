import { TestBed, inject } from '@angular/core/testing';

import { NodeGraphService } from './node-graph.service';

describe('NodeGraphService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NodeGraphService]
    });
  });

  it('should be created', inject([NodeGraphService], (service: NodeGraphService) => {
    expect(service).toBeTruthy();
  }));
});
