<script>
	import { 
		Card, 
		CardContent, 
		CardDescription, 
		CardHeader, 
		CardTitle,
		Button,
		Typography,
		Table,
		TableBody,
		TableCell,
		TableHeadCell,
		TableRow
	} from "$lib/components/aea";

	let { data } = $props();

	// Mock user data - in production, this would come from the database
	let users = $derived([
		{
			email: data.user.email,
			nickname: data.user.nickname,
			role: data.user.role,
			lastLogin: new Date().toLocaleDateString('de-DE')
		}
	]);
</script>

<svelte:head>
	<title>Benutzer-Verwaltung - AEA Graph Visualization</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<Typography tag="h1" variant="h1">Benutzer-Verwaltung</Typography>
		<Typography variant="body" class="text-muted-foreground mt-2">Verwalte Benutzer und deren Zugriffsrechte</Typography>
	</div>

	<Card variant="glass">
		<CardHeader>
			<CardTitle>Benutzer-Liste</CardTitle>
			<CardDescription>
				Übersicht aller registrierten Benutzer
			</CardDescription>
		</CardHeader>
		<CardContent>
			<Table>
				<thead>
					<TableRow>
						<TableHeadCell>E-Mail</TableHeadCell>
						<TableHeadCell>Name</TableHeadCell>
						<TableHeadCell>Rolle</TableHeadCell>
						<TableHeadCell>Letzter Login</TableHeadCell>
						<TableHeadCell align="right">Aktionen</TableHeadCell>
					</TableRow>
				</thead>
				<TableBody>
					{#each users as user (user.email)}
						<TableRow>
							<TableCell>{user.email}</TableCell>
							<TableCell>{user.nickname}</TableCell>
							<TableCell>
								<span class="capitalize">{user.role}</span>
							</TableCell>
							<TableCell>{user.lastLogin}</TableCell>
							<TableCell align="right">
								<Button variant="ghost" size="sm">
									Bearbeiten
								</Button>
							</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</CardContent>
	</Card>

	<Card variant="glass">
		<CardHeader>
			<CardTitle>Hinweis</CardTitle>
		</CardHeader>
		<CardContent>
			<Typography variant="body" class="text-sm text-muted-foreground">
				Die vollständige Benutzer-Verwaltung wird in einer zukünftigen Version implementiert. 
				Benutzer werden derzeit über Auth0 verwaltet.
			</Typography>
		</CardContent>
	</Card>
</div>

