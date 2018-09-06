import { Component, OnInit, Input, HostListener } from '@angular/core';
import { NodeGraphService } from "../../services/node-graph.service";
import { graphNode } from '../../models/graphNode';
import { Status } from '../../models/E_Status';
import * as Dracula from 'graphdracula';
import { Type } from '../../models/E_Type';

@Component({
  selector: 'app-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.css']
})

export class NodeComponent implements OnInit {

  @Input()
  screenWidth : number
  @Input()
  screenHeight : number

  allGraphNodes : graphNode[];
  Statuses = Status
  Types = Type
  
  selectedNode : graphNode

  constructor(private nodeGraphService : NodeGraphService) { }


  ngOnInit() {
    this.nodeGraphService.createNodes();
    this.nodeGraphService.getAllObservableNodes().subscribe(nodes => this.allGraphNodes = nodes)
    this.selectedNode = new graphNode()
    this.selectedNode.id = "Default"
    
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

    document.getElementById('canvas').innerHTML = '';

    nodesToDraw.forEach(element => {
      if (element.id.includes("Enrich")) element.status = Status.Complete

      var customProcessRender = this.customRenderNode(element)

      graph.addNode(element.id, {
        label: "Process",
        render: customProcessRender,
      });

      element.outputs.forEach(outputEle => { 
        if (outputEle.id.includes("Exposure")) outputEle.status = Status.Failed
        
        var customOutputsRender = this.customRenderNode(outputEle)

        graph.addNode(outputEle.id + " Output", { label: "Output",
          render: customOutputsRender,
        });
        graph.addEdge(element.id, outputEle.id + " Output", {
          directed: true,
          label: "Creates",
        } )
      });

      element.sources.forEach(sourceEle => {
        if (sourceEle.id.includes("Enrich")) sourceEle.status = Status.Invalid
        else if (sourceEle.id.includes("Disc")) sourceEle.status = Status.Complete
        else if (sourceEle.id.includes("CPF")) sourceEle.status = Status.InProgress

        var customSourcesRender = this.customRenderNode(sourceEle)

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
    var layouter = new Dracula.Layout.Spring(graph)
    layouter.layout();

    var renderer = new Dracula.Renderer.Raphael('#canvas', graph, window.innerWidth / 3 * 2, window.innerHeight);
    renderer.draw()
  }

  @HostListener('window:resize')
  onResize() {
    this.drawAllNodes();
}

  private nodeColor(node : graphNode) : string {
    var color = ""
    switch (node.type) {
      case Type.Process:
        color = '#555'
      break ;
      case Type.Source:
        color = '#0af'
      break ;
      case Type.Output:
        color = '#fa0'
      break ;
    }
    switch (node.status) {
      case Status.Complete:
        color = '#0a0'
      break ;
      case Status.InProgress:
        color = '#808'
      break ;
      case Status.Invalid:
        color = '#faa'
      break ;
      case Status.Failed:
        color = '#a00'
      break ;
    }
    if (color == "")
      color = '#000'
    return (color)
  }

  private customRenderNode(element : graphNode) {
    return (this.customRender(this.nodeColor(element), element))
  }

  private determineEnumKey(element) : string {
    var enumKey = ""

    switch(element.type) {
      case Type.Process:
        enumKey = "Process"
      break ;
      case Type.Source:
        enumKey = "Source"
      break ;
      case Type.Output:
        enumKey = "Output"
      break ;
    }

    switch(element.status) {
      case Status.Complete:
        enumKey = "Complete"
      break ;
      case Status.Failed:
        enumKey = "Failed"
      break ;
      case Status.InProgress:
        enumKey = "InProgress"
      break ;
      case Status.Invalid:
        enumKey = "Invalid"
      break ;
    }

    return enumKey
  }

  private customRender(hexColor : string, element : graphNode = null)
  {
    var screenAreaPixels : number = window.innerHeight * window.innerWidth;
    var innerNodeColor = this.nodeColor
    var innerDetermineKey = this.determineEnumKey

    //Custom attributes for nodes
    var outerSet = function(r, n)
    {
      var dragging : boolean = false
      var rx : number, ry : number;
      var prevBkgColor = '';
      rx = screenAreaPixels / 64800.648
      ry = rx / 3 * 2

      var idFontSize : number = screenAreaPixels / 98742.87
      var labelFontSize : number = screenAreaPixels / 188509.09

      var id = r.text(0, ry * 2, n.id).attr( { 'font-size': '0px', 'opacity': '0' } )
      var node = r.ellipse(0, 0, rx , ry).attr( { fill: hexColor, "stroke-width": '0', r: '0px' } )
      var label = r.text(0, 0, n.label).attr( { fill: "white", 'font-size': labelFontSize + 'px'} )

      var set = r.set()
        .push(node)
        .push(label)
        .push(id)
        .mousedown(function()
        {
          dragging = true
          id.attr( { 'font-size': '0px' } )
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

            var getEle = document.getElementById('key' + innerDetermineKey(element));
            prevBkgColor = getEle.style.backgroundColor
            getEle.style.backgroundColor = 'rgb(239, 119, 32)' //		R: 239 G: 119 B: 32

            if (element !== undefined && element !== null && element.type == Type.Process) {
              var sourceStrings = "", outStrings = ""
              var it = 0

              element.sources.forEach(source => {
                it++
                sourceStrings += "<span style='color:" + innerNodeColor(source) + "'>"
                if (it % 2 == 0)
                {
                  sourceStrings += source.id + "</span>,<br/>"
                }
                else
                {
                  sourceStrings += source.id + "</span>, "
                }
              })

              it = 0

              element.outputs.forEach(output => {
                it++;
                outStrings += "<span style='color:" + innerNodeColor(output) + "'>"
                if (it % 2 == 0)
                {
                  outStrings += output.id + "</span>,<br/>"
                }
                else
                {
                  outStrings += output.id + "</span>, "
                }
              })
              
              document.getElementById('nodeDetails').innerHTML =
              `<h4>Node</h4>
                <hr />
                <strong>Name</strong>: <span style='color:`+ innerNodeColor(element) + `'>`  + element.id + `</span>` +
              ` <hr />
                <strong>Sources</strong>: ` +  sourceStrings +
              ` <hr/>
                <strong>Outputs</strong>: ` + outStrings
              document.getElementById('nodeDetails').hidden = false
            }
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
            var getEle = document.getElementById('key' + innerDetermineKey(element));
            getEle.style.backgroundColor = prevBkgColor
            document.getElementById('nodeDetails').hidden = true
          }
        )
      return set;
    }
    return outerSet
  }
}