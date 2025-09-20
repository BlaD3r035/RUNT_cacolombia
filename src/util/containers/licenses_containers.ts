import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import UsersModels from "../../models/users_models.js";

export interface LicenseRequest {
  request_id: string;
  user_id: string;
  license_type: string;
  status: string;
  created_at: Date;
}

export default class Containers {
  static PAGE_SIZE = 5;

  /**
   * Construye y devuelve componentes listos para enviar (API JSON)
   * @returns Promise<any[]> -> array de API components (cada elemento tiene 'type')
   */
  static async buildLicenseRequestsComponents(
    requests: LicenseRequest[],
    page = 0,
  ): Promise<any[]> {
    const start = page * Containers.PAGE_SIZE;
    const pageRequests = requests.slice(start, start + Containers.PAGE_SIZE);

    const users = await Promise.all(
      pageRequests.map(async (req) => {
        try {
          const user = await UsersModels.getUserById(req.user_id);
          
          return user?.discord_id ?? null;
        } catch (err) {
          console.error(`Error obteniendo usuario ${req.user_id}:`, err);
          return null;
        }
      }),
    );

    const container = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `## Solicitudes de licencia (página ${page + 1}/${Math.ceil(
            requests.length / Containers.PAGE_SIZE,
          )})`,
        ),
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large),
      )
      .setAccentColor(0x0099ff);

    pageRequests.forEach((req, index) => {
      const discordId = users[index];
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          [
            `**ID:** ${req.request_id}`,
            `**Usuario:** ${
              discordId ? `<@${discordId}>` : `ID interno: ${req.user_id}`
            }`,
            `**Estado:** ${req.status}`,
            `**Fecha de solicitud:** ${req.created_at.toLocaleString()}`,
          ].join("\n"),
        ),
      );

      container.addActionRowComponents(
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(`manage_license_${page}_${index}_${req.request_id}`)
            .setLabel("Gestionar solicitud")
            .setStyle(ButtonStyle.Primary),
        ),
      );

      container.addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large),
      );
    });

    // paginación
    if (requests.length > Containers.PAGE_SIZE) {
      const maxPage = Math.ceil(requests.length / Containers.PAGE_SIZE) - 1;
      const paginationRow = new ActionRowBuilder<ButtonBuilder>();

      if (page > 0) {
        paginationRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`licenses_prev_${page - 1}`)
            .setLabel("⬅️ Anterior")
            .setStyle(ButtonStyle.Secondary),
        );
      }
      if (page < maxPage) {
        paginationRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`licenses_next_${page + 1}`)
            .setLabel("Siguiente ➡️")
            .setStyle(ButtonStyle.Secondary),
        );
      }

      container.addActionRowComponents(paginationRow);
    }

  
    const components = [container].map((c) =>
      typeof (c as any).toJSON === "function" ? (c as any).toJSON() : c,
    );

    return components;
  }
}
