'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Filter, Globe, Search, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface KnowledgeTableProps {
    sources: KnowledgeSource[];
    onSourceClick: (source: KnowledgeSource) => void;
    isLoading: boolean;
}

export const getTypeIcon = (type: SourceTypes) => {
    switch(type){
        case "website":
            return <Globe className="w-4 h-4 text-blue-400" />;
        case "upload":
        case "docs":
            return <Upload className="w-4 h-4 text-emerald-400" />;
        case "text":
            return <FileText className="w-4 h-4 text-zinc-400" />;
        default:
            return <FileText className="w-4 h-4 text-zinc-400" />;
    }
}

export const getStatusBadge = (status: SourceStatus) => {
    switch (status) {
        case "active": return <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-none">Active</Badge>;
        case "training": return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-none">Training</Badge>;
        case "error": return <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 shadow-none">Error</Badge>;
        case "excluded": return <Badge variant="secondary" className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20 border-zinc-500 shadow-none">Excluded</Badge>;
        default: return <Badge variant="outline" className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20 border-zinc-500 shadow-none">Unknown</Badge>;
    }
}

export const KnowledgeTable = ({ sources, onSourceClick, isLoading }: KnowledgeTableProps) => {
    return (
        <Card className="border-white/10 bg-[#0a0a0e]">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium text-white">
                        Knowledge Sources
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500"/>
                            <Input className="pl-10 h-9 w-50 md:w-75 bg-white/2 border-white/2 border-white/10 text-sm" placeholder="Search source..."
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5">
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </div>    
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-xs uppercase font-medium text-zinc-500">Name</TableHead>
                            <TableHead className="text-xs uppercase font-medium text-zinc-500">Type</TableHead>
                            <TableHead className="text-xs uppercase font-medium text-zinc-500">Status</TableHead>
                            <TableHead className="text-xs uppercase font-medium text-zinc-500">Last Updated</TableHead>
                            <TableHead className="text-xs uppercase font-medium text-zinc-500">Actions</TableHead>
                        </TableRow>
                        
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            // Show skeleton loaders when loading
                            Array.from({length: 5}).map((_,i) => (
                                <TableRow key={i} className="border-white/5">
                                    <TableCell>
                                        <Skeleton className="h-5 w-32 bg-white/5" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-20 bg-white/5" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-16 bg-white/5" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-24 bg-white/5" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-5 w-16 bg-white/5" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : sources.length > 0 ? (
                            // Show actual data when not loading and sources exist
                            sources.map((source, index) => (
                                <TableRow key={source.id || index} className="border-white/5 hover:bg-white/2 cursor-pointer transition-colors" onClick={() => onSourceClick(source)}>
                                    <TableCell className="font-medium text-zinc-200">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(source.type as SourceTypes)}
                                            <div className="flex flex-col">
                                                <span>{source.name}</span>
                                                {source.source_url && (
                                                    <span className="text-xs text-zinc-500 font-normal">
                                                        {source.source_url}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-400 capitalize">
                                        {source.type}
                                    </TableCell>
                                    <TableCell className="text-zinc-400 capitalize">
                                        {getStatusBadge(source.status as SourceStatus)}
                                    </TableCell>
                                    <TableCell className="text-zinc-500 text-sm">
                                        {source.last_updated ? new Date(source.last_updated).toLocaleDateString() : source.created_at ? new Date(source.created_at).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" className="h-8 text-zinc-400 hover:text-white hover:bg-white/2">
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            // Show empty state when no sources
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-zinc-500">
                                    No knowledge sources found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

            </CardContent> 
            
        </Card>
    );
};

export default KnowledgeTable;
