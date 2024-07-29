import CustomNode from '@/CustomNode';
import React, { useEffect, useMemo, useState } from 'react';
import { ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow } from 'reactflow';
import type { Node, Edge } from 'reactflow';
import ELK, { type ELK as ELKType } from 'elkjs/lib/elk.bundled.js';

import 'reactflow/dist/style.css';
import { initialEdges, initialNodes } from '@/nodesEdges';

const layoutOptions = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': 100,
  'elk.spacing.nodeNode': 80,
  'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
  'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
  'elk.direction': 'DOWN'
};

function App() {
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  
  const [isLayouted, setIsLayouted] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const { fitView } = useReactFlow();

  const getLayoutedElements = (nodes: Node[], edges: Edge[], setNodes: (nodes: Node[]) => void) => {
    const elk = new ELK();
    const graph = {
      id: 'graph',
      layoutOptions: layoutOptions,
      children: nodes.map(node => {
        // nested instances will store it's initial nodes/edges inside data attribute (node.data), 
        // it will use width and height from node.data.initialSize
        if (node.data.initialNodes.length > 0) {
          return { ...node, width: node.data.isShowComponents ? node.data.initialSize.width : 180, height: node.data.isShowComponents ? node.data.initialSize.height : 60 }
        } else {
          return { ...node, width: 180, height: 60 }
        }
      }
      ),
      edges: edges,
    };

    const globalOptions = {
      layoutOptions: {
        'elk.alignment': 'TOP'
      }
    }

    // @ts-ignore
    elk.layout(graph, globalOptions).then(({ children }) => {
      children?.forEach((node) => {
        // @ts-ignore
        node.position = { x: node.x, y: node.y };
      });

      if (children) {
        setNodes(children as Node[]);
      }
    });
  }

  useEffect(() => {
    if (!isLayouted && nodes.length > 0) {
      getLayoutedElements(nodes, edges, setNodes)
      setIsLayouted(true)
    }

    window.requestAnimationFrame(() => {
      fitView();
    });
  }, [nodes, edges])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div className='p-4'>
        <button onClick={() => {
          // this will trigger and show nested instances
          setNodes((nds) =>
            nds.map((node) => {
              if (node.data.isLeaf) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    isShowComponents: !node.data.isShowComponents
                  },
                };
              }

              return node;
            }),
          )
          setIsLayouted(false)
        }} className='border border-black px-2 py-1'>Nested Instances</button>
      </div>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      />
    </div>
  );
}

export default function () {
  return (
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  );
}