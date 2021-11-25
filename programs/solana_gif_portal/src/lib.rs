use anchor_lang::prelude::*;

declare_id!("8Ag4UkcLV5KLG3u1y2r5VUyJYGn1JoVzcDXv3JXVP3A9");

#[program]
pub mod solana_gif_portal {
    use super::*;
    pub fn start_stuff_off(ctx: Context<StartStuffOff>) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;

        base_account.total_gifs = 0;

        Ok(())
    }

    pub fn add_gif(ctx: Context<AddGif>, gif_link: String) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        let user = &mut ctx.accounts.user;

        let item = ItemStruct {
            gif_link: gif_link,
            user_address: *user.to_account_info().key,
            upvotes: 0,
        };

        base_account.gif_list.push(item);
        base_account.total_gifs += 1;

        Ok(())
    }

    pub fn upvote_gif(ctx: Context<Upvote>, gif_link: String) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;

        let gif = base_account.gif_list.iter_mut().find(|gif| gif.gif_link == gif_link);

        if let Some(gif) = gif {
            gif.upvotes += 1;

            Ok(())
        } else {
            Err(ProgramError::InvalidArgument)
        }
    }
}

#[derive(Accounts)]
pub struct StartStuffOff<'info> {
    #[account(init, payer = user, space = 9000)]
    pub base_account: Account<'info, BaseAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddGif<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct Upvote<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
}

#[account]
pub struct BaseAccount {
    pub total_gifs: u64,

    pub gif_list: Vec<ItemStruct>,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ItemStruct {
    pub gif_link: String,
    pub user_address: Pubkey,
    pub upvotes: u64,
}
