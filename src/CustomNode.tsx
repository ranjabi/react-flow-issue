import { Handle, Position } from 'reactflow';
import React, { useEffect, useState } from 'react';
import { ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow } from 'reactflow';
import Dagre from '@dagrejs/dagre';
import type { Node, Edge } from 'reactflow';

function CustomNode({ data }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(data.initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(data.initialEdges);
  const [layouted, setLayouted] = useState(false)
  const { fitView } = useReactFlow();

  const getLayoutedElements = (nodes: Node[], edges: Edge[], options: { direction: string }) => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: options.direction });

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) => g.setNode(node.id, node));

    Dagre.layout(g);

    return {
      nodes: nodes.map((node) => {
        const { x, y } = g.node(node.id);

        return { ...node, position: { x: x - node.width / 2, y: y - node.height / 2 } };
      }),
      edges,
    };
  };

  useEffect(() => {
    if (!layouted && nodes.length > 0) {
      const direction = 'TB'
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        { direction }
      );

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);

      const allNodesInitialized = nodes.every(n => n.width);

      if (allNodesInitialized) {
        setLayouted(true)
      }
    }

    window.requestAnimationFrame(() => {
      fitView();
    });

  }, [nodes, edges])

  return (
    <div style={{
      border: '1px solid #1a192b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '3px',
      background: 'white',
      width: data.initialNodes.length > 0 && data.isShowComponents ? data.initialSize.width : 180,
      height: data.initialNodes.length > 0 && data.isShowComponents ? data.initialSize.height : 60,
      textAlign: 'center'
    }}>
      <Handle type="target" position={Position.Top} />
      {/* show nested instances if this condition true, otherwise just show a div in custom node */}
      {data.isShowComponents ? <ReactFlow
          key={data.id}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
        /> : <div>{data.label}</div>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default function Wrapper(props) {
  return (
    <ReactFlowProvider>
      <CustomNode {...props} />
    </ReactFlowProvider>
  );
}