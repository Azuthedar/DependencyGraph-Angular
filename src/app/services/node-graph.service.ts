import { Injectable, Input } from '@angular/core';
import { graphNode } from "../graphNode"
import * as Dracula from 'graphdracula';

@Injectable({
  providedIn: 'root'
})
export class NodeGraphService {

  private jsonData : JSON;
  private graphNodes : graphNode[];
  constructor() { }

  ngOnInit()
  {
    this.jsonData = JSON.parse(`{
      "subProcesses": [
        {
          "name": "EnrichCollateral",
          "sources": [
            "SAS_CLN",
            "SAS_REPO",
            "PlumCollateral",
            "CPFExposure",
            "TreasuryExposure"
          ],
          "outputs": [
            "EnrichedCollateral"
          ]
        },
        {
          "name": "EnrichExposure",
          "sources": [
            "CPFExposure",
            "TreasuryExposure",
            "PlumExposure",
            "OtherExposure",
            "SAS_Impairment_IB",
            "SAS_Impairment_Corporate",
            "CPF_Watchlist",
            "CIB_WriteOff",
            "CIB_Watchlist"
          ],
          "outputs": [
            "EnrichedExposure",
            "EnrichedExposureTemp"
          ]
        },
        {
          "name": "ModelInput",
          "sources": [
            "DataSanityExposure",
            "EnrichedCollateral"
          ],
          "outputs": [
            "ModelInputExposure",
            "ModelInputCashflow",
            "ModelInputCollateral"
          ]
        },
        {
          "name": "ModelOutput",
          "sources": [
            "ModelOutput",
            "DataSanityExposure",
            "ModelInputExposure"
          ],
          "outputs": [
            "FinalImpairmentExposure"
          ]
        },
        {
          "name": "VarianceReport",
          "sources": [
            "FinalImpairmentExposure"
          ],
          "outputs": [
            "VarianceReport"
          ]
        },
        {
          "name": "FinalImpairmentExposure_HDFSToWindows",
          "sources": [
            "FinalImpairmentExposure"
          ],
          "outputs": []
        },
        {
          "name": "DisclosureReport",
          "sources": [
            "DisclosureExposureOutput",
            "EnrichedCollateral",
            "DisclosureExcoMapping"
          ],
          "outputs": [
            "Disclosure",
            "Disclosure_Control"
          ]
        },
        {
          "name": "MonthlyMOTDisclosure",
          "sources": [
            "DisclosureExposure"
          ],
          "outputs": [
            "MonthlyMOTDisclosure"
          ]
        },
        {
          "name": "OpeningMOTDisclosure",
          "sources": [
            "DisclosureExposure"
          ],
          "outputs": [
            "MonthlyMOTDisclosure"
          ]
        },
        {
          "name": "YTDMOTDisclosure",
          "sources": [
            "MonthlyMOTDisclosure"
          ],
          "outputs": [
            "YTDMOTDisclosure"
          ]
        },
        {
          "name": "EnrichedExposure_HDFSToWindows",
          "sources": [
            "EnrichedExposure"
          ],
          "outputs": []
        },
        {
          "name": "Disclosure_HDFSToWindows",
          "sources": [
            "Disclosure"
          ],
          "outputs": []
        },
        {
          "name": "YTDMOTDisclosure_HDFSToWindows",
          "sources": [
            "YTDMOTDisclosure"
          ],
          "outputs": []
        },
        {
          "name": "Disclosure_Control_HDFSToWindows",
          "sources": [
            "Disclosure_Control"
          ],
          "outputs": []
        },
        {
          "name": "VarianceReport_HDFSToWindows",
          "sources": [
            "VarianceReport"
          ],
          "outputs": []
        },
        {
          "name": "ModelInputExposure_HDFSToWindows",
          "sources": [
            "ModelInputExposure"
          ],
          "outputs": []
        },
        {
          "name": "ModelInputCollateral_HDFSToWindows",
          "sources": [
            "ModelInputCollateral"
          ],
          "outputs": []
        },
        {
          "name": "ModelInputCashflow_HDFSToWindows",
          "sources": [
            "ModelInputCashflow"
          ],
          "outputs": []
        }
      ]
    }`)

    this.graphNodes = new Array<graphNode>();
  }

  createNodes()
  {
    this.ngOnInit();
    this.jsonData['subProcesses'].forEach(element => {
      var node : graphNode = new graphNode();
      
      node.id = element.name;
    
      node.sources = new Array<graphNode>();
      node.outputs = new Array<graphNode>();

      node.clicked = false;
      element.sources.forEach(source => {
        var sourceNode = new graphNode();
        
        sourceNode.id = source;

        sourceNode.clicked = false;
        node.sources.push(sourceNode);
      });

      element.outputs.forEach(output => {
        var outputNode = new graphNode();

        outputNode.id = output;

        outputNode.clicked = false;
        node.outputs.push(outputNode);
      });
      this.graphNodes.push(node);
    });
  }

  getAllNodes() : graphNode[]
  {
    return (this.graphNodes);
  }

  getAllChildNodes(parentNode : graphNode) : graphNode[]
  {
      var allNodes : graphNode[] = new Array<graphNode>();

      allNodes.push(parentNode);

      if (parentNode.sources !== undefined)
      {
        parentNode.sources.forEach(source => {
          allNodes.concat(this.getAllChildNodes(source));
        });
      }

      if (parentNode.outputs !== undefined)
      {
        parentNode.outputs.forEach(output => {
          allNodes.concat(this.getAllChildNodes(output));
        });
      }
      return allNodes;
  }
}
