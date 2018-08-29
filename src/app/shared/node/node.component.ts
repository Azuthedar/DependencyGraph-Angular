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
  
  allGraphNodes : graphNode[];
  screenWidth : number
  screenHeight : number

  constructor(private nodeGraphService : NodeGraphService) { }


  ngOnInit() {
    this.nodeGraphService.createNodes();
    this.allGraphNodes = this.nodeGraphService.getAllNodes();
    this.screenHeight = 1920
    this.screenWidth = 1080
    
    console.log("From (Height)\tInit:\t" + this.screenHeight);
    console.log("From (Width)\tInit:\t" + this.screenWidth)
  }

  drawAllNodes() : void
  {
    this.drawGraph(this.nodeGraphService.getAllNodes());
  }

  drawGraph(nodesToDraw : graphNode[]) : void
  {
    var graph = new Dracula.Graph();

    var customProcessRender = this.customRender('#555');
    var customSourcesRender = this.customRender('#0af');
    var customOutputsRender = this.customRender('#fa0');

    document.getElementById('canvas').innerHTML = '';

    nodesToDraw.forEach(element => {
      graph.addNode(element.id, {
        label: "Process",
        render: customProcessRender,
      });

      element.outputs.forEach(outputEle => {
          graph.addNode(outputEle.id + " Output", { label: "Output",
          render: customOutputsRender,
        });
        graph.addEdge(element.id, outputEle.id + " Output", {
          directed: true,
          label: "Creates",
        } )
      });

      element.sources.forEach(sourceEle => {
        graph.addNode(sourceEle.id + " Source", { label: "Source",
          render: customSourcesRender
        });
        //Need to loop through all the nodes to find the sources' outputs
        nodesToDraw.forEach(node => {
          node.outputs.forEach(outputNode => {
            if (outputNode.id == sourceEle.id)
            {
              graph.addEdge(sourceEle.id + " Source", outputNode.id + " Output", { 
                directed: true,
                label: "Depends",
              });
            }
          })
        })
        graph.addEdge(element.id, sourceEle.id + " Source", {directed: true } );
      });
    });
    var layouter = new Dracula.Layout.Spring(graph);
    layouter.layout();

    var renderer = new Dracula.Renderer.Raphael('#canvas', graph, this.screenWidth, this.screenHeight);
    renderer.draw()
  }

  customRender(hexColor : string)
  {
    var screenAreaPixels : number = this.screenWidth * this.screenHeight
    //Custom attributes for nodes
    var outerSet = function(r, n)
    {
      var dragging : boolean = false
      var rx : number, ry : number;

      rx = screenAreaPixels / 64800.648
      ry = rx / 3 * 2

      var idFontSize : number = screenAreaPixels / 148114.285
      var labelFontSize : number = screenAreaPixels / 188509.09

      var id = r.text(0, ry * 1.5, n.id).attr( { 'font-size': '0px', 'opacity': '0' } )
      var node = r.ellipse(0, 0, rx , ry).attr( { fill: hexColor, "stroke-width": '0', r: '0px' } )
      var label = r.text(0, 0, n.label).attr( { fill: "white", 'font-size': labelFontSize + 'px'} )

      var set = r.set()
        .push(node)
        .push(label)
        .push(id)
        //.drag(null, function onStart() { dragging = true; id.attr( { 'font-size': '0px' } ) }, function onEnd() { dragging = false })
        .mousedown(function()
        {
          dragging = true; id.attr( { 'font-size': '0px' } )
        })
        .mouseup(function() {
          if (dragging)
          {
            dragging = false;
            id.attr( { 'font-size': idFontSize + 'px' } )
          }
        })
        .hover(function mouseIn() {
          if (!dragging)
          {
            id.attr( { 'font-size': idFontSize + 'px' } )
            id.animate({ 'opacity': 1 }, 200)
            id.toFront()
            node.toFront()
            label.hide()
            label.toFront()
          }
          else
          {
            id.attr( { 'font-size': '0px', 'opacity': 0 } )
          }
        }, function mouseOut() {
            id.attr( { 'font-size': '0px' } )
            id.animate({ 'opacity': 0 }, 200)
            id.toBack()
            label.show()
          }
        )
      return set;
    }
    return outerSet
  }
}