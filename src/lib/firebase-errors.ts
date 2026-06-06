export function formatFirebaseError(error: unknown): string {
  const message =
    error instanceof Error ? error.message : 'Não foi possível concluir a operação.'

  if (message.includes('Missing or insufficient permissions')) {
    return (
      'Sem permissão no Firestore. No Firebase Console → Firestore → Regras, ' +
      'cole o conteúdo de firestore.rules e clique em Publicar. ' +
      'Confirme também que você está logado com Google.'
    )
  }

  if (message.includes('requires an index')) {
    return (
      'Índice do Firestore pendente. Abra o link do erro no console do navegador ' +
      'ou execute: firebase deploy --only firestore:indexes ' +
      '(índices em firestore.indexes.json).'
    )
  }

  return message
}
