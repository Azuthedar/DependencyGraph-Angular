import { Component, OnInit } from '@angular/core';
import { graphNode } from '../../models/graphNode';
import { Type } from '../../models/E_Type'
import { Status } from '../../models/E_Status'
import { NodeGraphService } from '../../services/node-graph.service';
import { HttpRequest } from 'selenium-webdriver/http';

@Component({
  selector: 'app-node-details',
  templateUrl: './node-details.component.html',
  styleUrls: ['./node-details.component.css']
})
export class NodeDetailsComponent implements OnInit {

  Statuses = Status
  Types = Type

  constructor(private nodeGraphService : NodeGraphService) { }
  ngOnInit() {
  }
}
