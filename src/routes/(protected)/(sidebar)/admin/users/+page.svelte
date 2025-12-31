<script>
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$components/ui/card";
	import { Button } from "$components/ui/button";
	import * as Table from "$components/ui/table";

	let { data } = $props();

	// Mock user data - in production, this would come from the database
	let users = $state([
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
		<h1 class="text-3xl font-bold">Benutzer-Verwaltung</h1>
		<p class="text-muted-foreground mt-2">Verwalte Benutzer und deren Zugriffsrechte</p>
	</div>

	<Card>
		<CardHeader>
			<CardTitle>Benutzer-Liste</CardTitle>
			<CardDescription>
				Übersicht aller registrierten Benutzer
			</CardDescription>
		</CardHeader>
		<CardContent>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>E-Mail</Table.Head>
						<Table.Head>Name</Table.Head>
						<Table.Head>Rolle</Table.Head>
						<Table.Head>Letzter Login</Table.Head>
						<Table.Head class="text-right">Aktionen</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each users as user (user.email)}
						<Table.Row>
							<Table.Cell>{user.email}</Table.Cell>
							<Table.Cell>{user.nickname}</Table.Cell>
							<Table.Cell>
								<span class="capitalize">{user.role}</span>
							</Table.Cell>
							<Table.Cell>{user.lastLogin}</Table.Cell>
							<Table.Cell class="text-right">
								<Button variant="ghost" size="sm">
									Bearbeiten
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle>Hinweis</CardTitle>
		</CardHeader>
		<CardContent>
			<p class="text-sm text-muted-foreground">
				Die vollständige Benutzer-Verwaltung wird in einer zukünftigen Version implementiert. 
				Benutzer werden derzeit über Auth0 verwaltet.
			</p>
		</CardContent>
	</Card>
</div>

