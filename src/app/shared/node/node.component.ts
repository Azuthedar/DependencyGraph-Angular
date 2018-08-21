import { Component, OnInit } from '@angular/core';
import { NodeGraphService } from "../../services/node-graph.service";
import { graphNode } from '../../graphNode';
import * as Dracula from 'graphdracula';

@Component({
  selector: 'app-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.css']
})
export class NodeComponent implements OnInit {

  constructor(private nodeGraphService : NodeGraphService) { }

  ngOnInit() {
    this.nodeGraphService.createNodes();
  }
  
  drawNodes()
  {
    var graph = new Dracula.Graph();
    var allNodes = this.nodeGraphService.getAllNodes();

    console.log("AllNodes: " + allNodes);
    allNodes.forEach(element => {
      graph.addNode(element.id);
      
      element.outputs.forEach(outputEle => {
        graph.addNode(outputEle.id);
        graph.addEdge(element.id, outputEle.id, {directed: true});
      });

      element.sources.forEach(sourceEle => {
        graph.addNode(sourceEle.id);
        graph.addEdge(element.id, sourceEle.id, {directed: true});
      });
    });

    var layouter = new Dracula.Layout.TournamentTree(graph);
    layouter.layout();

    var renderer = new Dracula.Renderer.Raphael("#canvas", graph, 2000, 2000);
    renderer.draw();
  }
}