
export function PageHeader({ title, description, children }: { title: string, description: string, children?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>
            {children}
        </div>
    )
}
